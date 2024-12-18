 
const express = require('express');  
const jwt = require('jsonwebtoken');  
let books = require("./booksdb.js");  
const regd_users = express.Router();  

// Usaremos el arreglo de usuarios pasado desde el index.js  
let users = [];  

const isValid = (username) => {  
    // Verificar si el nombre de usuario cumple con las reglas  
    return typeof username === 'string' && username.length > 0; // Ejemplo básico de validación  
};  

const authenticatedUser = (username, password) => {  
    // Verificar si el usuario y la contraseña coinciden  
    return users.some(user => user.username === username && user.password === password);  
};  

// Ruta para iniciar sesión de usuarios registrados  
regd_users.post("/login", (req, res) => {  
    const { username, password } = req.body; // Obtener el nombre y la contraseña del cuerpo de la solicitud  

    // Comprobar que ambos campos están presentes  
    if (!username || !password) {  
        return res.status(400).json({ message: "Username and password are required!" });  
    }  

    // Autenticar usuario  
    if (authenticatedUser(username, password)) {  
        // Crear un JWT  
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });  

        // Guardar el token y el nombre de usuario en sesión  
        req.session.authorization = { accessToken, username };  

        return res.status(200).json({ message: "User successfully logged in!", accessToken });  
    } else {  
        return res.status(401).json({ message: "Invalid Login. Check username and password" });  
    }  
});  

// Ruta para agregar una reseña de libro  
regd_users.put("/auth/review/:isbn", (req, res) => {  
    const isbn = req.params.isbn;  
    const { review } = req.body; // Obtener la reseña del cuerpo de la solicitud  
    const username = req.session.authorization.username; // Obtener el nombre de usuario de la sesión  

    // Aquí podrías agregar la logica para definir como almacenar las reseñas  
    const book = books[isbn]; // Asegúrate de que tu `books` tiene la estructura adecuada  

    if (book) {  
        // Comprobar que la reseña se proporciona  
        if (!review) {  
            return res.status(400).json({ message: "Review is required!" });  
        }  

        // Si las reseñas son un objeto en el libro, asegurate de inicializar uno  
        if (!book.reviews) {  
            book.reviews = {};  
        }  
        // Agregar la reseña bajo el usuario  
        book.reviews[username] = review;  

        return res.status(201).json({ message: "Review added successfully!" });  
    } else {  
        return res.status(404).json({ message: "Book not found!" });  
    }  
}); 
// Delete a book review  
regd_users.delete("/auth/review/:isbn", (req, res) => {  
    const isbn = req.params.isbn; // Obtener el ISBN de los parámetros de la solicitud  
    const username = req.session.authorization.username; // Obtener el nombre de usuario de la sesión  

    const book = books[isbn]; // Buscar el libro usando el ISBN  

    if (book) {  
        // Comprobar si se han dejado reseñas  
        if (book.reviews && book.reviews[username]) {  
            delete book.reviews[username]; // Eliminar la reseña del usuario  
            return res.status(200).json({ message: "Review deleted successfully!" });  
        } else {  
            return res.status(404).json({ message: "No review found for this user!" });  
        }  
    } else {  
        return res.status(404).json({ message: "Book not found!" });  
    }  
});


module.exports.authenticated = regd_users;  
module.exports.isValid = isValid;  
module.exports.users = users;