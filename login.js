const express = require('express');
const router = express.Router();
const connection = require('../database/connection'); // Ajusta la ruta según tu estructura
const bcrypt = require('bcryptjs'); // Usa bcryptjs si estás usando ese

// Ruta para manejar el login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validar campos vacíos
    if (!username || !password) {
        return res.status(400).send('Por favor ingrese un usuario y contraseña');
    }

    console.log('Usuario ingresado:', username); // Log del usuario ingresado

    // Consulta para obtener el usuario
    connection.query('SELECT * FROM usuarios WHERE usuario = ?', [username], (err, results) => {
        if (err) {
            console.error('Error en la consulta de base de datos:', err); // Registrar el error
            return res.status(500).send('Error en la base de datos');
        }

        // Verificar si hay resultados
        if (results.length === 0) {
            console.log('Usuario no encontrado en la base de datos.'); // Log si el usuario no existe
            return res.status(404).send('El usuario/contraseña ingresado es incorrecto'); // Mensaje modificado
        }

        const user = results[0];

        // Comparar contraseñas con bcrypt
        bcrypt.compare(password, user.contraseña, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err); // Registrar el error
                return res.status(500).send('Error en la autenticación');
            }
            if (result) {
                // Autenticación exitosa
                req.session.usuario = user.usuario; // Guardar en sesión
                res.status(200).send('Autenticación exitosa');
            } else {
                // Contraseña incorrecta
                console.log('Contraseña incorrecta para el usuario:', username); // Log si la contraseña es incorrecta
                res.status(401).send('El usuario/contraseña ingresado es incorrecto'); // Mensaje unificado
            }
        });
    });
});

module.exports = router;
