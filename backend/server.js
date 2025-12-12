require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehiculos', require('./routes/vehiculoRoutes'));
app.use('/api/tarifas', require('./routes/tarifaRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));
app.use('/api/turnos', require('./routes/turnoRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API de Parqueadero funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error no controlado:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   SISTEMA DE PARQUEADERO - SENA 2025      ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log(`║ 🚀 Servidor iniciado correctamente        ║`);
    console.log(`║ 📍 URL: http://localhost:${PORT.toString().padEnd(19)} ║`);
    console.log(`║ 🌍 Entorno: ${(process.env.NODE_ENV || 'development').padEnd(26)} ║`);
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

module.exports = app;
