const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/tarifaController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', tarifaController.getTarifas);

// Solo administradores pueden crear/editar/eliminar
router.post('/', isAdmin, tarifaController.crearTarifa);
router.put('/:id', isAdmin, tarifaController.actualizarTarifa);
router.delete('/:id', isAdmin, tarifaController.eliminarTarifa);

module.exports = router;
