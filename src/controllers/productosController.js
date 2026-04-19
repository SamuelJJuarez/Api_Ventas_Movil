import sql from '../config/database.js';

// Obtener todos los productos (Para el listado en la app)
export const obtenerProductos = async (req, res) => {
    try {
        const productos = await sql`
            SELECT * FROM productos ORDER BY nombre ASC
        `;
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al consultar los productos' });
    }
};

// Obtener producto por código de barras (Vital para el Escáner)
export const obtenerProductoPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const [producto] = await sql`
            SELECT * FROM productos WHERE codigo_barras = ${codigo}
        `;

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el producto' });
    }
};

// Crear un nuevo producto (con inserción parametrizada segura)
export const crearProducto = async (req, res) => {
    const { codigo_barras, nombre, descripcion, precio, stock } = req.body;
    try {
        const [nuevoProducto] = await sql`
            INSERT INTO productos (codigo_barras, nombre, descripcion, precio, stock)
            VALUES (${codigo_barras}, ${nombre}, ${descripcion}, ${precio}, ${stock})
            RETURNING *
        `;
        res.status(201).json(nuevoProducto);
    } catch (error) {
        if (error.code === '23505') { // Violación de UNIQUE
            return res.status(400).json({ error: 'El código de barras ya está registrado' });
        }
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};