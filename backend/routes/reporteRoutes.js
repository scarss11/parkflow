const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y ser administrador
router.use(authMiddleware, isAdmin);

router.get('/ingresos', reporteController.reporteIngresos);
router.get('/historial', reporteController.historial);
router.get('/turnos', reporteController.reporteTurnos);

module.exports = router;
