import express from 'express';
import { login, registrar } from '../controllers/authController.js';

const router = express.Router();

// Ruta de login (POST /api/auth/login)
router.post('/login', login);
router.post('/registro', registrar);

export default router;