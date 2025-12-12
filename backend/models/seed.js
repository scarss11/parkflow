const db = require('../config/database');
const bcrypt = require('bcrypt');

async function seedUsuarios() {
    try {
        console.log('🌱 Iniciando seed de usuarios...\n');

        // Usuarios con contraseñas a encriptar
        const usuarios = [
            {
                email: 'admin@parking.com',
                password: 'admin123',
                nombre: 'Administrador Sistema'
            },
            {
                email: 'operario@parking.com',
                password: 'operario123',
                nombre: 'Operario Principal'
            }
        ];

        for (const usuario of usuarios) {
            // Verificar si existe
            const [existente] = await db.query(
                'SELECT id FROM usuarios WHERE email = ?',
                [usuario.email]
            );

            // Encriptar contraseña
            const password_hash = await bcrypt.hash(usuario.password, 10);

            if (existente.length > 0) {
                // Actualizar
                await db.query(
                    'UPDATE usuarios SET password_hash = ?, nombre = ? WHERE email = ?',
                    [password_hash, usuario.nombre, usuario.email]
                );
                console.log(`✅ Usuario actualizado: ${usuario.email}`);
            } else {
                console.log(`⚠️  Usuario no encontrado en BD: ${usuario.email}`);
                console.log(`   Ejecuta primero: mysql < database/schema.sql`);
            }

            console.log(`   📧 Email: ${usuario.email}`);
            console.log(`   🔑 Password: ${usuario.password}\n`);
        }

        console.log('✅ Seed completado exitosamente!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed:', error.message);
        process.exit(1);
    }
}

seedUsuarios();
