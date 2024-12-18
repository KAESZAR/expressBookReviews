  
const express = require('express');  
const jwt = require('jsonwebtoken');  
const session = require('express-session');  
const customer_routes = require('./router/auth_users.js').authenticated;  
const genl_routes = require('./router/general.js').general;  

let users = [];  

// Verificar si un usuario con el nombre de usuario dado ya existe  
const doesExist = (username) => {  
    return users.some(user => user.username === username);  
};  

// Verificar si el usuario con el nombre de usuario y la contraseña dados existe  
const authenticatedUser = (username, password) => {  
    return users.some(user => user.username === username && user.password === password);  
};  

const app = express();  

app.use("/customer", session({secret: "fingerprint_customer", resave: true, saveUninitialized: true}));  
app.use(express.json());  

// Middleware para autenticar las solicitudes a los endpoints de "/customer/auth"  
app.use("/customer/auth/*", function auth(req, res, next) {  
    // Verificar si el usuario ha iniciado sesión y tiene un token de acceso válido  
    if (req.session.authorization) {  
        let token = req.session.authorization['accessToken'];  
        // Verificar el token JWT  
        jwt.verify(token, "access", (err, user) => {  
            if (!err) {  
                req.user = user; // Guardar información del usuario  
                next(); // Continuar al siguiente middleware  
            } else {  
                return res.status(403).json({ message: "User not authenticated" });  
            }  
        });  
    } else {  
        return res.status(403).json({ message: "User not logged in" });  
    }  
});  

// Endpoint de inicio de sesión  
app.post("/customer/login", (req, res) => {  
    const username = req.body.username;  
    const password = req.body.password;  

    // Comprobar si faltan el nombre de usuario o la contraseña  
    if (!username || !password) {  
        return res.status(400).json({ message: "Username and password are required!" });  
    }  

    // Autenticar al usuario  
    if (authenticatedUser(username, password)) {  
        // Generar un token de acceso  
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });  

        // Almacenar el token de acceso y el nombre de usuario en la sesión  
        req.session.authorization = {  
            accessToken, username  
        };  

        return res.status(200).json({ message: "User successfully logged in!", accessToken });  
    } else {  
        return res.status(401).json({ message: "Invalid Login. Check username and password" });  
    }  
});  

// Endpoint para registrar un nuevo usuario  
app.post("/customer/register", (req, res) => {  
    const username = req.body.username;  
    const password = req.body.password;  

    // Comprobar si se proporcionaron el nombre de usuario y la contraseña  
    if (username && password) {  
        // Comprobar si el usuario no existe ya  
        if (!doesExist(username)) {  
            // Agregar el nuevo usuario al arreglo  
            users.push({ username, password });  
            return res.status(201).json({ message: "User successfully registered. Now you can login" });  
        } else {  
            return res.status(400).json({ message: "User already exists!" });  
        }  
    }  
    return res.status(400).json({ message: "Unable to register user." });  
});  

const PORT = 5000;  

// Rutas para usuarios autenticados y generales  
app.use("/customer", customer_routes);  
app.use("/", genl_routes);  

app.listen(PORT, () => console.log("Server is running on port " + PORT));