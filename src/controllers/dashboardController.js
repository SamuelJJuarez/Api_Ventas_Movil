import sql from '../config/database.js';

export const obtenerMetricasDashboard = async (req, res) => {
    try {
        // Ejecutamos las tres consultas al mismo tiempo para optimizar la velocidad
        const [ingresosResult, ventasPorDia, productosMasVendidos] = await Promise.all([

            // 1. Ingresos Totales de toda la historia
            sql`
                SELECT COALESCE(SUM(total), 0) as ingresos_totales 
                FROM ventas
            `,

            // 2. Ventas por día (Últimos 7 días con ventas)
            sql`
                SELECT DATE(fecha_venta) as fecha, SUM(total) as total_dia 
                FROM ventas 
                GROUP BY DATE(fecha_venta) 
                ORDER BY fecha DESC 
                LIMIT 7
            `,

            // 3. Top 5 Productos más vendidos
            sql`
                SELECT p.nombre, SUM(dv.cantidad) as total_vendido 
                FROM detalle_ventas dv
                JOIN productos p ON dv.producto_id = p.id
                GROUP BY p.id, p.nombre
                ORDER BY total_vendido DESC
                LIMIT 5
            `
        ]);

        // Estructuramos la respuesta para que a la app Android le sea fácil consumirla
        res.json({
            ingresos_totales: ingresosResult[0].ingresos_totales,
            ventas_por_dia: ventasPorDia,
            productos_top: productosMasVendidos
        });

    } catch (error) {
        console.error('Error al generar métricas del dashboard:', error);
        res.status(500).json({ error: 'Error interno al generar el dashboard' });
    }
};