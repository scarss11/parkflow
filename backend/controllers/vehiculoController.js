const db = require('../config/database');

// Obtener estadísticas del dashboard
exports.getEstadisticas = async (req, res) => {
    try {
        // Disponibilidad por tipo
        const [disponibilidad] = await db.query('SELECT * FROM vista_disponibilidad');

        // Obtener espacios ocupados por tipo
        for (let disp of disponibilidad) {
            const [espaciosOcupados] = await db.query(
                `SELECT e.codigo 
         FROM espacios e 
         WHERE e.tipo_vehiculo_id = ? AND e.disponible = 0`,
                [disp.id]
            );
            disp.ocupados_espacios = espaciosOcupados.map(e => e.codigo);

            // ✅ Convertir a números para evitar concatenación
            disp.total_espacios = parseInt(disp.total_espacios) || 0;
            disp.disponibles = parseInt(disp.disponibles) || 0;
            disp.ocupados = parseInt(disp.ocupados) || 0;
        }

        // Vehículos activos
        const [activos] = await db.query(
            'SELECT COUNT(*) as total FROM registros WHERE estado = "EN_CURSO"'
        );

        // Ingresos del día
        const [ingresosDia] = await db.query(
            `SELECT COALESCE(SUM(valor_final), 0) as total 
             FROM registros 
             WHERE DATE(fecha_hora_salida) = CURDATE() 
             AND estado = 'FINALIZADO'`
        );

        // Ingresos del mes
        const [ingresosMes] = await db.query(
            `SELECT COALESCE(SUM(valor_final), 0) as total 
             FROM registros 
             WHERE MONTH(fecha_hora_salida) = MONTH(CURDATE()) 
             AND YEAR(fecha_hora_salida) = YEAR(CURDATE())
             AND estado = 'FINALIZADO'`
        );

        // Vehículos atendidos hoy
        const [atendidosHoy] = await db.query(
            `SELECT COUNT(*) as total 
             FROM registros 
             WHERE DATE(fecha_hora_entrada) = CURDATE()`
        );

        res.json({
            success: true,
            estadisticas: {
                disponibilidad,
                vehiculos_activos: activos[0].total,
                ingresos_hoy: ingresosDia[0].total,
                ingresos_mes: ingresosMes[0].total,
                ingresos_dia: parseFloat(ingresosDia[0].total),
                ingresos_mes: parseFloat(ingresosMes[0].total),
                atendidos_hoy: atendidosHoy[0].total
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
};

// Obtener vehículos activos
exports.getVehiculosActivos = async (req, res) => {
    try {
        const [vehiculos] = await db.query('SELECT * FROM vista_vehiculos_activos');

        // Procesar cada vehículo para agregar campos necesarios
        const vehiculosProcesados = vehiculos.map(v => {
            const minutos = v.minutos_transcurridos || 0;
            const horas = Math.floor(minutos / 60);
            const mins = minutos % 60;

            // Formato de tiempo
            let tiempo_transcurrido = '';
            if (horas > 0) {
                tiempo_transcurrido = `${horas}h ${mins}m`;
            } else {
                tiempo_transcurrido = `${mins} min`;
            }

            // Calcular monto estimado
            let monto_total = 0;
            if (v.tipo_cobro && v.valor_tarifa) {
                const valor = parseFloat(v.valor_tarifa);
                if (v.tipo_cobro === 'POR_HORA') {
                    monto_total = Math.ceil(minutos / 60) * valor;
                } else if (v.tipo_cobro === 'POR_MINUTO') {
                    monto_total = minutos * valor;
                } else if (v.tipo_cobro === 'POR_DIA') {
                    monto_total = Math.ceil(minutos / 1440) * valor;
                }
            }

            return {
                ...v,
                tiempo_transcurrido,
                monto_total
            };
        });

        res.json({
            success: true,
            vehiculos: vehiculosProcesados
        });
    } catch (error) {
        console.error('Error obteniendo vehículos activos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo vehículos activos'
        });
    }
};

// Registrar entrada de vehículo
exports.registrarEntrada = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { placa, tipo_vehiculo_id } = req.body;
        const usuario_id = req.user.id;

        if (!placa || !tipo_vehiculo_id) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Placa y tipo de vehículo son requeridos'
            });
        }

        // Verificar si el vehículo ya está en el parqueadero
        const [vehiculoExistente] = await connection.query(
            'SELECT id FROM registros WHERE placa = ? AND estado = "EN_CURSO"',
            [placa.toUpperCase()]
        );

        if (vehiculoExistente.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Este vehículo ya se encuentra en el parqueadero'
            });
        }

        // Verificar disponibilidad
        const [disponibilidad] = await connection.query(
            'SELECT disponibles FROM vista_disponibilidad WHERE id = ?',
            [tipo_vehiculo_id]
        );

        if (disponibilidad.length === 0 || disponibilidad[0].disponibles === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No hay espacios disponibles para este tipo de vehículo'
            });
        }

        // Asignar espacio disponible
        const [espacios] = await connection.query(
            'SELECT id, codigo FROM espacios WHERE tipo_vehiculo_id = ? AND disponible = 1 LIMIT 1',
            [tipo_vehiculo_id]
        );

        if (espacios.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No hay espacios disponibles'
            });
        }

        const espacio_id = espacios[0].id;
        const espacio_codigo = espacios[0].codigo;

        // Obtener tarifa activa
        const [tarifas] = await connection.query(
            `SELECT id FROM tarifas 
             WHERE tipo_vehiculo_id = ? 
             AND activo = 1 
             AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
             ORDER BY fecha_inicio DESC LIMIT 1`,
            [tipo_vehiculo_id]
        );

        const tarifa_id = tarifas.length > 0 ? tarifas[0].id : null;

        // Registrar entrada
        const [result] = await connection.query(
            `INSERT INTO registros (placa, tipo_vehiculo_id, espacio_id, fecha_hora_entrada, 
             tarifa_id, estado, usuario_entrada_id) 
             VALUES (?, ?, ?, NOW(), ?, 'EN_CURSO', ?)`,
            [placa.toUpperCase(), tipo_vehiculo_id, espacio_id, tarifa_id, usuario_id]
        );

        const registro_id = result.insertId;

        // Marcar espacio como ocupado
        await connection.query(
            'UPDATE espacios SET disponible = 0 WHERE id = ?',
            [espacio_id]
        );

        // Generar código de ticket
        const codigo_ticket = `ENT-${Date.now()}-${registro_id}`;

        // Crear ticket de entrada
        await connection.query(
            'INSERT INTO tickets (registro_id, codigo_ticket, tipo_ticket) VALUES (?, ?, "ENTRADA")',
            [registro_id, codigo_ticket]
        );

        // Actualizar turno activo si existe
        await connection.query(
            `UPDATE turnos SET vehiculos_ingresados = vehiculos_ingresados + 1 
             WHERE usuario_id = ? AND estado = 'ABIERTO'`,
            [usuario_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Entrada registrada exitosamente',
            registro: {
                id: registro_id,
                placa: placa.toUpperCase(),
                espacio: espacio_codigo,
                codigo_ticket,
                fecha_entrada: new Date()
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error registrando entrada:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando entrada',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Buscar vehículo por placa
exports.buscarVehiculo = async (req, res) => {
    try {
        const { placa } = req.params;

        const [vehiculos] = await db.query(
            `SELECT 
                r.id,
                r.placa,
                tv.nombre as tipo_vehiculo,
                e.codigo as numero_espacio,
                r.fecha_hora_entrada,
                TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) as tiempo_minutos,
                t.id as tarifa_id,
                t.nombre as tarifa_nombre,
                t.tipo_cobro,
                t.valor,
                t.valor_fraccion,
                t.minutos_fraccion
             FROM registros r
             INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
             LEFT JOIN espacios e ON r.espacio_id = e.id
             LEFT JOIN tarifas t ON r.tarifa_id = t.id
             WHERE r.placa = ? AND r.estado = 'EN_CURSO'`,
            [placa.toUpperCase()]
        );

        if (vehiculos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado o ya ha salido'
            });
        }

        const vehiculo = vehiculos[0];

        // Calcular monto estimado
        let monto_estimado = 0;
        if (vehiculo.tarifa_id) {
            const minutos = vehiculo.tiempo_minutos;
            const tipo_cobro = vehiculo.tipo_cobro;
            const valor = parseFloat(vehiculo.valor);
            const valor_fraccion = parseFloat(vehiculo.valor_fraccion || 0);
            const minutos_fraccion = vehiculo.minutos_fraccion || 15;

            if (tipo_cobro === 'POR_HORA') {
                monto_estimado = Math.ceil(minutos / 60) * valor;
            } else if (tipo_cobro === 'POR_MINUTO') {
                monto_estimado = minutos * valor;
            } else if (tipo_cobro === 'FRACCION') {
                monto_estimado = Math.ceil(minutos / minutos_fraccion) * valor_fraccion;
            } else if (tipo_cobro === 'POR_DIA') {
                monto_estimado = Math.ceil(minutos / 1440) * valor;
            }
        }

        vehiculo.monto_estimado = monto_estimado;

        res.json({
            success: true,
            vehiculo
        });
    } catch (error) {
        console.error('Error buscando vehículo:', error);
        res.status(500).json({
            success: false,
            message: 'Error buscando vehículo'
        });
    }
};

// Registrar salida de vehículo
exports.registrarSalida = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { registro_id, descuento_porcentaje, descuento_valor, observaciones } = req.body;
        const usuario_id = req.user.id;

        // Obtener registro
        const [registros] = await connection.query(
            `SELECT r.*, t.tipo_cobro, t.valor, t.valor_fraccion, t.minutos_fraccion
             FROM registros r
             LEFT JOIN tarifas t ON r.tarifa_id = t.id
             WHERE r.id = ? AND r.estado = 'EN_CURSO'`,
            [registro_id]
        );

        if (registros.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado o ya finalizado'
            });
        }

        const registro = registros[0];
        const minutos_totales = Math.ceil((Date.now() - new Date(registro.fecha_hora_entrada)) / 60000);

        // Calcular valor
        let valor_calculado = 0;
        if (registro.tarifa_id) {
            const tipo_cobro = registro.tipo_cobro;
            const valor = parseFloat(registro.valor);
            const valor_fraccion = parseFloat(registro.valor_fraccion || 0);
            const minutos_fraccion = registro.minutos_fraccion || 15;

            if (tipo_cobro === 'POR_HORA') {
                valor_calculado = Math.ceil(minutos_totales / 60) * valor;
            } else if (tipo_cobro === 'POR_MINUTO') {
                valor_calculado = minutos_totales * valor;
            } else if (tipo_cobro === 'FRACCION') {
                valor_calculado = Math.ceil(minutos_totales / minutos_fraccion) * valor_fraccion;
            } else if (tipo_cobro === 'POR_DIA') {
                valor_calculado = Math.ceil(minutos_totales / 1440) * valor;
            }
        }

        // Aplicar descuentos
        let valor_final = valor_calculado;
        const descuento_porc = parseFloat(descuento_porcentaje || 0);
        const descuento_val = parseFloat(descuento_valor || 0);

        if (descuento_porc > 0) {
            valor_final -= (valor_final * descuento_porc / 100);
        }
        if (descuento_val > 0) {
            valor_final -= descuento_val;
        }

        valor_final = Math.max(0, valor_final); // No negativo

        // Actualizar registro
        await connection.query(
            `UPDATE registros SET 
             fecha_hora_salida = NOW(),
             minutos_totales = ?,
             valor_calculado = ?,
             descuento_porcentaje = ?,
             descuento_valor = ?,
             valor_final = ?,
             estado = 'FINALIZADO',
             observaciones = ?,
             usuario_salida_id = ?
             WHERE id = ?`,
            [minutos_totales, valor_calculado, descuento_porc, descuento_val,
                valor_final, observaciones, usuario_id, registro_id]
        );

        // Liberar espacio
        if (registro.espacio_id) {
            await connection.query(
                'UPDATE espacios SET disponible = 1 WHERE id = ?',
                [registro.espacio_id]
            );
        }

        // Actualizar turno
        await connection.query(
            `UPDATE turnos SET 
             vehiculos_egresados = vehiculos_egresados + 1,
             total_recaudado = total_recaudado + ?
             WHERE usuario_id = ? AND estado = 'ABIERTO'`,
            [valor_final, usuario_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Salida registrada exitosamente',
            registro: {
                registro_id,
                placa: registro.placa,
                minutos_totales,
                valor_calculado,
                descuentos: descuento_porc + descuento_val,
                monto_final: valor_final
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error registrando salida:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando salida',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener tipos de vehículo
exports.getTiposVehiculo = async (req, res) => {
    try {
        const [tipos] = await db.query('SELECT * FROM tipos_vehiculo');
        res.json({ success: true, tipos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo tipos' });
    }
};
