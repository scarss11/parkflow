const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y ser administrador
router.use(authMiddleware, isAdmin);

router.get('/', usuarioController.getUsuarios);
router.get('/roles', usuarioController.getRoles);
router.post('/', usuarioController.crearUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.put('/:id/password', usuarioController.cambiarPasswordUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
