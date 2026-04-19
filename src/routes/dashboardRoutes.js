import express from 'express';
import { obtenerMetricasDashboard } from '../controllers/dashboardController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protegemos la ruta
router.use(verificarToken);

// Endpoint: GET /api/dashboard
router.get('/', obtenerMetricasDashboard);

export default router;