const express = require('express');
const router = express.Router();
const connection = require('../database/connection');
const bcrypt = require('bcrypt');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Por favor complete todos los campos');
    }

    try {
        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el usuario en la base de datos
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).send('Error al registrar el usuario');
            }
            res.status(201).send('Usuario registrado con éxito');
        });
    } catch (error) {
        res.status(500).send('Error al procesar el registro');
    }
});

module.exports = router;
