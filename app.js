const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const connection = require('./database/connection');
const app = express();

// Servir archivos estáticos
app.use(express.static(__dirname)); // Permite acceder a archivos estáticos

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Ruta para la página principal (catálogo)
app.get('/catalogo', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login.html'); // Asegúrate de usar .html aquí
    }
    res.sendFile(__dirname + '/catalogo.html');
});

// Ruta para login
app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Ruta para login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validar campos vacíos
    if (!username || !password) {
        return res.status(400).send('Por favor ingrese un usuario y contraseña');
    }

    // Consulta para obtener el usuario
    connection.query('SELECT * FROM usuarios WHERE usuario = ?', [username], (err, results) => {
        if (err) {
            console.error('Error en la consulta de base de datos:', err);
            return res.status(500).send('Error en la base de datos');
        }

        // Verificar si hay resultados
        if (results.length === 0) {
            return res.status(404).send('El usuario/contraseña ingresado es incorrecto');
        }

        const user = results[0];

        // Comparar contraseñas con bcrypt
        bcrypt.compare(password, user.contraseña, (err, result) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en la autenticación');
            }
            if (result) {
                // Autenticación exitosa
                req.session.usuario = user.usuario; // Almacenar el usuario en la sesión
                res.status(200).send('Autenticación exitosa');
            } else {
                // Contraseña incorrecta
                res.status(401).send('El usuario/contraseña ingresado es incorrecto');
            }
        });
    });
});

// Ruta para registro
app.post('/register', (req, res) => {
    const { cedula, nombre, usuario, contraseña, email } = req.body;

    // Validar si el usuario ya existe
    const queryCheck = 'SELECT * FROM usuarios WHERE usuario = ?';
    connection.query(queryCheck, [usuario], (err, results) => {
        if (err) {
            console.error('Error en la consulta de usuario:', err);
            return res.status(500).send('Error en la base de datos');
        }

        if (results.length > 0) {
            return res.send('El usuario ya existe');
        }

        const hash = bcrypt.hashSync(contraseña, 10);
        const queryInsert = 'INSERT INTO usuarios (cedula, nombre, usuario, contraseña, email) VALUES (?, ?, ?, ?, ?)';
        connection.query(queryInsert, [cedula, nombre, usuario, hash, email], (err, results) => {
            if (err) {
                console.error('Error al registrar el usuario:', err);
                return res.status(500).send('Error al registrar el usuario');
            }
            res.send('Registro exitoso');
        });
    });
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login.html'); // Redirigir a la página de login
    });
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
