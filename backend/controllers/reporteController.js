const db = require('../config/database');

// Reporte de ingresos por fecha
exports.reporteIngresos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin son requeridas'
            });
        }

        // Total de ingresos
        const [ingresos] = await db.query(
            `SELECT 
                COALESCE(SUM(valor_final), 0) as ingreso_total,
                COUNT(*) as total_vehiculos,
                COALESCE(AVG(minutos_totales), 0) as tiempo_promedio,
                COALESCE(AVG(valor_final), 0) as ticket_promedio
             FROM registros
             WHERE DATE(fecha_hora_salida) BETWEEN ? AND ?
             AND estado = 'FINALIZADO'`,
            [fecha_inicio, fecha_fin]
        );

        // Ingresos por tipo de vehículo
        const [porTipo] = await db.query(
            `SELECT 
                tv.nombre as tipo_vehiculo,
                COUNT(*) as cantidad,
                COALESCE(SUM(r.valor_final), 0) as ingreso,
                ROUND((COALESCE(SUM(r.valor_final), 0) / 
                    (SELECT COALESCE(SUM(valor_final), 1) FROM registros 
                     WHERE DATE(fecha_hora_salida) BETWEEN ? AND ? AND estado = 'FINALIZADO')) * 100, 2) as porcentaje
             FROM registros r
             INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
             WHERE DATE(r.fecha_hora_salida) BETWEEN ? AND ?
             AND r.estado = 'FINALIZADO'
             GROUP BY tv.id, tv.nombre`,
            [fecha_inicio, fecha_fin, fecha_inicio, fecha_fin]
        );

        res.json({
            success: true,
            reporte: {
                ingreso_total: parseFloat(ingresos[0].ingreso_total),
                total_vehiculos: ingresos[0].total_vehiculos,
                tiempo_promedio: parseFloat(ingresos[0].tiempo_promedio),
                ticket_promedio: parseFloat(ingresos[0].ticket_promedio),
                por_tipo: porTipo.map(t => ({
                    tipo_vehiculo: t.tipo_vehiculo,
                    total_vehiculos: t.cantidad,
                    total_ingresos: parseFloat(t.ingreso),
                    porcentaje: parseFloat(t.porcentaje)
                }))
            }
        });
    } catch (error) {
        console.error('Error en reporte de ingresos:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando reporte'
        });
    }
};

// Historial de registros
exports.historial = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, limit = 50 } = req.query;

        let query = `
            SELECT 
                r.id,
                r.placa,
                tv.nombre as tipo_vehiculo,
                e.codigo as espacio,
                r.fecha_hora_entrada,
                r.fecha_hora_salida,
                r.minutos_totales,
                r.valor_final as monto_cobrado,
                r.estado,
                u1.nombre as operario_entrada,
                u2.nombre as operario_salida
            FROM registros r
            INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
            LEFT JOIN espacios e ON r.espacio_id = e.id
            LEFT JOIN usuarios u1 ON r.usuario_entrada_id = u1.id
            LEFT JOIN usuarios u2 ON r.usuario_salida_id = u2.id
            WHERE 1=1
        `;

        const params = [];

        if (fecha_inicio && fecha_fin) {
            query += ' AND DATE(r.fecha_hora_entrada) BETWEEN ? AND ?';
            params.push(fecha_inicio, fecha_fin);
        }

        query += ' ORDER BY r.fecha_hora_entrada DESC LIMIT ?';
        params.push(parseInt(limit));

        const [registros] = await db.query(query, params);

        res.json({
            success: true,
            registros: registros.map(r => ({
                ...r,
                monto_cobrado: parseFloat(r.monto_cobrado || 0)
            }))
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo historial'
        });
    }
};

// Reporte de turnos
exports.reporteTurnos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let query = `
            SELECT 
                t.id,
                u.nombre as usuario,
                t.fecha_inicio,
                t.fecha_fin,
                t.vehiculos_ingresados,
                t.vehiculos_egresados,
                t.total_recaudado,
                t.estado,
                t.observaciones
            FROM turnos t
            INNER JOIN usuarios u ON t.usuario_id = u.id
            WHERE 1=1
        `;

        const params = [];

        if (fecha_inicio && fecha_fin) {
            query += ' AND DATE(t.fecha_inicio) BETWEEN ? AND ?';
            params.push(fecha_inicio, fecha_fin);
        }

        query += ' ORDER BY t.fecha_inicio DESC';

        const [turnos] = await db.query(query, params);

        res.json({
            success: true,
            turnos: turnos.map(t => ({
                ...t,
                total_recaudado: parseFloat(t.total_recaudado)
            }))
        });
    } catch (error) {
        console.error('Error en reporte de turnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando reporte de turnos'
        });
    }
};
