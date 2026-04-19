import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Importamos tus rutas separadas
import authRoutes from './routes/authRoutes.js';
import productosRoutes from './routes/productosRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        version: '1.0.0'
    });
});

// --- ORQUESTACIÓN DE RUTAS ---

// Conectamos las rutas de autenticación
app.use('/api/auth', authRoutes);

// Conectamos las rutas de productos (Ya protegidas internamente)
app.use('/api/productos', productosRoutes);

// Conectamos las rutas de ventas (Ya protegidas internamente)
app.use('/api/ventas', ventasRoutes);

// Conectamos las rutas del dashboard (Ya protegidas internamente)
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});