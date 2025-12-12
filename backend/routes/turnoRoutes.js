const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/abrir', turnoController.abrirTurno);
router.get('/activo', turnoController.getTurnoActivo);
router.post('/cerrar', turnoController.cerrarTurno);
router.get('/historial', turnoController.historialTurnos);

module.exports = router;
