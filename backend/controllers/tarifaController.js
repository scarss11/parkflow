const db = require('../config/database');

// Obtener todas las tarifas
exports.getTarifas = async (req, res) => {
    try {
        const [tarifas] = await db.query(
            `SELECT t.*, tv.nombre as tipo_vehiculo
             FROM tarifas t
             INNER JOIN tipos_vehiculo tv ON t.tipo_vehiculo_id = tv.id
             ORDER BY t.activo DESC, tv.nombre, t.fecha_inicio DESC`
        );

        res.json({
            success: true,
            tarifas
        });
    } catch (error) {
        console.error('Error obteniendo tarifas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo tarifas'
        });
    }
};

// Crear nueva tarifa
exports.crearTarifa = async (req, res) => {
    try {
        const {
            tipo_vehiculo_id,
            nombre,
            tipo_cobro,
            valor,
            valor_fraccion,
            minutos_fraccion,
            fecha_inicio,
            fecha_fin,
            descripcion
        } = req.body;

        if (!tipo_vehiculo_id || !nombre || !tipo_cobro || !valor || !fecha_inicio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        const [result] = await db.query(
            `INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, 
             valor_fraccion, minutos_fraccion, fecha_inicio, fecha_fin, descripcion, activo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [tipo_vehiculo_id, nombre, tipo_cobro, valor, valor_fraccion, 
             minutos_fraccion, fecha_inicio, fecha_fin, descripcion]
        );

        res.json({
            success: true,
            message: 'Tarifa creada exitosamente',
            tarifa_id: result.insertId
        });
    } catch (error) {
        console.error('Error creando tarifa:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando tarifa',
            error: error.message
        });
    }
};

// Actualizar tarifa
exports.actualizarTarifa = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const validFields = [
            'nombre', 'tipo_cobro', 'valor', 'valor_fraccion', 
            'minutos_fraccion', 'activo', 'fecha_inicio', 'fecha_fin', 'descripcion'
        ];

        const setClause = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (validFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos válidos para actualizar'
            });
        }

        values.push(id);

        await db.query(
            `UPDATE tarifas SET ${setClause.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Tarifa actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando tarifa:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando tarifa'
        });
    }
};

// Eliminar tarifa
exports.eliminarTarifa = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la tarifa está en uso
        const [enUso] = await db.query(
            'SELECT COUNT(*) as count FROM registros WHERE tarifa_id = ?',
            [id]
        );

        if (enUso[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una tarifa que está en uso. Desactívela en su lugar.'
            });
        }

        await db.query('DELETE FROM tarifas WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Tarifa eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando tarifa:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando tarifa'
        });
    }
};
