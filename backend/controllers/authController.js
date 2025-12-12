const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const [users] = await db.query(
            `SELECT u.*, r.nombre as rol 
             FROM usuarios u 
             INNER JOIN roles r ON u.rol_id = r.id 
             WHERE u.email = ? AND u.activo = 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar última sesión
        await db.query(
            'UPDATE usuarios SET ultima_sesion = NOW() WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                rol: user.rol,
                nombre: user.nombre 
            },
            process.env.JWT_SECRET || 'secret-key-2025',
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                telefono: user.telefono
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

// Verificar sesión
exports.verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verificando token'
        });
    }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT password_hash FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE usuarios SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
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
