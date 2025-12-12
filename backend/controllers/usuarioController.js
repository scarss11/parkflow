const db = require('../config/database');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, 
                    u.fecha_creacion, u.ultima_sesion, r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             ORDER BY u.fecha_creacion DESC`
        );

        res.json({
            success: true,
            usuarios
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios'
        });
    }
};

// Crear usuario
exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol_id, telefono } = req.body;

        if (!nombre || !email || !password || !rol_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Verificar si el email ya existe
        const [existente] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol_id, telefono) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, password_hash, rol_id, telefono]
        );

        res.json({
            success: true,
            message: 'Usuario creado exitosamente',
            usuario_id: result.insertId
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando usuario',
            error: error.message
        });
    }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, activo, rol_id } = req.body;

        const updates = {};
        if (nombre !== undefined) updates.nombre = nombre;
        if (telefono !== undefined) updates.telefono = telefono;
        if (activo !== undefined) updates.activo = activo;
        if (rol_id !== undefined) updates.rol_id = rol_id;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos para actualizar'
            });
        }

        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await db.query(
            `UPDATE usuarios SET ${setClause} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando usuario'
        });
    }
};

// Cambiar contraseña de usuario (admin)
exports.cambiarPasswordUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE usuarios SET password_hash = ? WHERE id = ?',
            [password_hash, id]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error cambiando contraseña'
        });
    }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir eliminar al usuario autenticado
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puede eliminar su propia cuenta'
            });
        }

        // Verificar si tiene registros
        const [registros] = await db.query(
            'SELECT COUNT(*) as count FROM registros WHERE usuario_entrada_id = ? OR usuario_salida_id = ?',
            [id, id]
        );

        if (registros[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar un usuario con registros. Desactívelo en su lugar.'
            });
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando usuario'
        });
    }
};

// Obtener roles
exports.getRoles = async (req, res) => {
    try {
        const [roles] = await db.query('SELECT * FROM roles');
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo roles' });
    }
};
