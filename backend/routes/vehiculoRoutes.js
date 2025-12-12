const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/estadisticas', vehiculoController.getEstadisticas);
router.get('/activos', vehiculoController.getVehiculosActivos);
router.get('/tipos', vehiculoController.getTiposVehiculo);
router.get('/buscar/:placa', vehiculoController.buscarVehiculo);
router.post('/entrada', vehiculoController.registrarEntrada);
router.post('/salida', vehiculoController.registrarSalida);

module.exports = router;
