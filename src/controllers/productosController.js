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

// POST: Crear un nuevo producto (Soportando el estado activo/inactivo)
export const crearProducto = async (req, res) => {
    const { codigo_barras, nombre, descripcion, precio, stock, activo } = req.body;
    try {
        // Si 'activo' no viene en el cuerpo, por defecto se inserta como true
        const estadoActivo = activo !== undefined ? activo : true;

        const [nuevoProducto] = await sql`
            INSERT INTO productos (codigo_barras, nombre, descripcion, precio, stock, activo)
            VALUES (${codigo_barras}, ${nombre}, ${descripcion}, ${precio}, ${stock}, ${estadoActivo})
            RETURNING *
        `;
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error('Error al crear producto:', error);
        if (error.code === '23505') { // Violación de restricción UNIQUE
            return res.status(400).json({ error: 'El código de barras ya está registrado' });
        }
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// PUT: Actualizar un producto existente (Excluyendo código de barras de la modificación)
export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, activo } = req.body;

    try {
        const [productoActualizado] = await sql`
            UPDATE productos 
            SET nombre = ${nombre}, 
                descripcion = ${descripcion}, 
                precio = ${precio}, 
                stock = ${stock}, 
                activo = ${activo}
            WHERE id = ${id}
            RETURNING *
        `;

        if (!productoActualizado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json(productoActualizado);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};