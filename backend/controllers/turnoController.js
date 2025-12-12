const db = require('../config/database');

// Abrir turno
exports.abrirTurno = async (req, res) => {
    try {
        const usuario_id = req.user.id;

        // Verificar si ya tiene un turno abierto
        const [turnoActivo] = await db.query(
            'SELECT id FROM turnos WHERE usuario_id = ? AND estado = "ABIERTO"',
            [usuario_id]
        );

        if (turnoActivo.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya tiene un turno abierto'
            });
        }

        const [result] = await db.query(
            'INSERT INTO turnos (usuario_id, fecha_inicio, estado) VALUES (?, NOW(), "ABIERTO")',
            [usuario_id]
        );

        res.json({
            success: true,
            message: 'Turno abierto exitosamente',
            turno_id: result.insertId
        });
    } catch (error) {
        console.error('Error abriendo turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error abriendo turno'
        });
    }
};

// Obtener turno activo
exports.getTurnoActivo = async (req, res) => {
    try {
        const usuario_id = req.user.id;

        const [turnos] = await db.query(
            `SELECT * FROM turnos 
             WHERE usuario_id = ? AND estado = 'ABIERTO'
             ORDER BY fecha_inicio DESC LIMIT 1`,
            [usuario_id]
        );

        if (turnos.length === 0) {
            return res.json({
                success: true,
                turno: null
            });
        }

        const turno = turnos[0];
        turno.total_recaudado = parseFloat(turno.total_recaudado);

        res.json({
            success: true,
            turno
        });
    } catch (error) {
        console.error('Error obteniendo turno activo:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo turno activo'
        });
    }
};

// Cerrar turno
exports.cerrarTurno = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const usuario_id = req.user.id;
        const { observaciones } = req.body;

        // Obtener turno activo
        const [turnos] = await connection.query(
            'SELECT * FROM turnos WHERE usuario_id = ? AND estado = "ABIERTO"',
            [usuario_id]
        );

        if (turnos.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'No tiene un turno abierto'
            });
        }

        const turno = turnos[0];

        // Calcular totales del turno
        const [resumen] = await connection.query(
            `SELECT 
                COUNT(CASE WHEN estado = 'EN_CURSO' THEN 1 END) as ingresados,
                COUNT(CASE WHEN estado = 'FINALIZADO' THEN 1 END) as egresados,
                COALESCE(SUM(CASE WHEN estado = 'FINALIZADO' THEN valor_final ELSE 0 END), 0) as total_recaudado
             FROM registros
             WHERE usuario_entrada_id = ? 
             AND fecha_hora_entrada >= ?`,
            [usuario_id, turno.fecha_inicio]
        );

        const vehiculos_ingresados = resumen[0].ingresados + resumen[0].egresados;
        const vehiculos_egresados = resumen[0].egresados;
        const total_recaudado = parseFloat(resumen[0].total_recaudado);

        // Cerrar turno
        await connection.query(
            `UPDATE turnos SET 
             fecha_fin = NOW(),
             vehiculos_ingresados = ?,
             vehiculos_egresados = ?,
             total_recaudado = ?,
             estado = 'CERRADO',
             observaciones = ?
             WHERE id = ?`,
            [vehiculos_ingresados, vehiculos_egresados, total_recaudado, observaciones, turno.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Turno cerrado exitosamente',
            resumen: {
                vehiculos_ingresados,
                vehiculos_egresados,
                total_recaudado,
                duracion_horas: Math.round((Date.now() - new Date(turno.fecha_inicio)) / 3600000 * 10) / 10
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error cerrando turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error cerrando turno',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Historial de turnos
exports.historialTurnos = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const { limit = 10 } = req.query;

        const [turnos] = await db.query(
            `SELECT * FROM turnos 
             WHERE usuario_id = ? 
             ORDER BY fecha_inicio DESC 
             LIMIT ?`,
            [usuario_id, parseInt(limit)]
        );

        res.json({
            success: true,
            turnos: turnos.map(t => ({
                ...t,
                total_recaudado: parseFloat(t.total_recaudado)
            }))
        });
    } catch (error) {
        console.error('Error obteniendo historial de turnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo historial de turnos'
        });
    }
};
