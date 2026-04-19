import sql from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Sintaxis de la librería 'postgres' con template literal
        const [usuario] = await sql`
            SELECT * FROM usuarios WHERE email = ${email}
        `;

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const registrar = async (req, res) => {
    // Extraemos los datos del body. Si no envían rol, por defecto será 'vendedor'
    const { nombre, email, password, rol = 'vendedor' } = req.body;

    try {
        // 1. Encriptar la contraseña (10 rondas es el estándar seguro y rápido)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Insertar en la base de datos usando la sintaxis segura de la librería 'postgres'
        const [nuevoUsuario] = await sql`
            INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES (${nombre}, ${email}, ${password_hash}, ${rol})
            -- RETURNING nos devuelve los datos insertados, excepto el hash por seguridad
            RETURNING id, nombre, email, rol, creado_en
        `;

        // 3. Responder con éxito
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: nuevoUsuario
        });

    } catch (error) {
        // Manejar el error si el email ya existe en la base de datos (código 23505 en Postgres)
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
    }
};