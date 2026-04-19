import sql from '../config/database.js';

// Registrar una nueva venta (Transaccional)
export const registrarVenta = async (req, res) => {
    // Obtenemos el ID del usuario del token decodificado por el middleware
    const usuario_id = req.usuario.id;
    // Se espera un arreglo de productos: [{ producto_id: 1, cantidad: 2 }, { producto_id: 3, cantidad: 1 }]
    const { productos } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'La venta debe contener al menos un producto' });
    }

    try {
        // Iniciamos la transacción. 't' será el cliente transaccional que usaremos
        const resultadoVenta = await sql.begin(async (t) => {
            let total_venta = 0;
            const detallesVenta = [];

            // 1. Validar stock, calcular precios y preparar detalles
            for (const item of productos) {
                // Buscamos el producto en la BD para obtener su precio actual y stock
                const [productoDB] = await t`
                    SELECT id, nombre, precio, stock FROM productos WHERE id = ${item.producto_id}
                `;

                if (!productoDB) {
                    throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
                }

                if (productoDB.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para el producto: ${productoDB.nombre}. Disponible: ${productoDB.stock}, Solicitado: ${item.cantidad}`);
                }

                const subtotal = productoDB.precio * item.cantidad;
                total_venta += subtotal;

                // Guardamos la información calculada para insertarla después
                detallesVenta.push({
                    producto_id: productoDB.id,
                    cantidad: item.cantidad,
                    precio_unitario: productoDB.precio,
                    subtotal: subtotal
                });
            }

            // 2. Insertar la cabecera de la venta
            const [nuevaVenta] = await t`
                INSERT INTO ventas (usuario_id, total)
                VALUES (${usuario_id}, ${total_venta})
                RETURNING *
            `;

            // 3. Insertar los detalles y actualizar el stock iterativamente
            for (const detalle of detallesVenta) {
                // Insertar detalle
                await t`
                    INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (${nuevaVenta.id}, ${detalle.producto_id}, ${detalle.cantidad}, ${detalle.precio_unitario}, ${detalle.subtotal})
                `;

                // Actualizar (restar) stock
                await t`
                    UPDATE productos
                    SET stock = stock - ${detalle.cantidad}
                    WHERE id = ${detalle.producto_id}
                `;
            }

            // Si llegamos aquí sin errores, la transacción hace 'commit' automáticamente
            return {
                venta: nuevaVenta,
                detalles: detallesVenta
            };
        });

        // Respuesta exitosa
        res.status(201).json({
            mensaje: 'Venta registrada exitosamente',
            datos: resultadoVenta
        });

    } catch (error) {
        // Si hay un error, el 'throw' hace 'rollback' automáticamente y cae aquí
        console.error('Error al registrar la venta:', error);
        res.status(400).json({ error: error.message });
    }
};

// Obtener el historial de ventas del usuario (Para una vista general)
export const obtenerHistorialVentas = async (req, res) => {
    try {
        const ventas = await sql`
            SELECT v.id, v.total, v.fecha_venta, u.nombre as vendedor
            FROM ventas v
            JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha_venta DESC
        `;
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de ventas' });
    }
};