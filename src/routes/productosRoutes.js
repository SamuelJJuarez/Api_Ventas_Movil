import express from 'express';
import * as productosController from '../controllers/productosController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PROTEGEMOS TODAS LAS RUTAS DE ESTE ARCHIVO
// Cualquier petición aquí debe llevar el Token JWT
router.use(verificarToken);

// Endpoints:
router.get('/', productosController.obtenerProductos);
router.get('/codigo/:codigo', productosController.obtenerProductoPorCodigo);
router.post('/', productosController.crearProducto);
router.put('/:id', productosController.actualizarProducto);


export default router;