import express from 'express';
import * as ventasController from '../controllers/ventasController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protegemos todas las rutas
router.use(verificarToken);

// Registrar una nueva venta
router.post('/', ventasController.registrarVenta);

// Obtener todas las ventas
router.get('/', ventasController.obtenerHistorialVentas);

export default router;