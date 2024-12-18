const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // importar axios  

// Endpoint para obtener la lista de libros  
router.get("/books", async (req, res) => {  
  try {  
      const response = await axios.get('URL_DEL_SERVICIO_API_LIBROS'); // Reemplaza con la URL real de tu API  
      const books = response.data; // Suponiendo que la respuesta contiene una lista de libros  

      return res.status(200).json(books); // Enviar la lista de libros como respuesta  
  } catch (error) {  
      console.error("Error fetching books:", error); // Registrar el error en la consola  
      return res.status(500).json({ message: "Error fetching books." }); // Enviar un mensaje de error  
  }  
});  
// Endpoint para obtener los detalles de un libro basado en el ISBN  
router.get("/books/:isbn", async (req, res) => {  
  const { isbn } = req.params; // Obtener el ISBN de los parámetros de la solicitud  

  try {  
      const response = await axios.get(`URL_DEL_SERVICIO_API_LIBROS/${isbn}`); // Reemplaza con la URL real de tu API  
      const bookDetails = response.data; // Suponiendo que la respuesta contiene los detalles del libro  

      return res.status(200).json(bookDetails); // Enviar los detalles del libro como respuesta  
  } catch (error) {  
      console.error(`Error fetching book with ISBN ${isbn}:`, error); // Registrar el error en la consola  
      return res.status(404).json({ message: "Book not found." }); // Enviar un mensaje de error  
  }  
});
// Endpoint para obtener los detalles de libros basados en el autor  
router.get("/books/author/:author", async (req, res) => {  
  const { author } = req.params; // Obtener el nombre del autor de los parámetros de la solicitud  

  try {  
      const response = await axios.get(`URL_DEL_SERVICIO_API_LIBROS?author=${encodeURIComponent(author)}`); // Ajustar la URL según tu API  
      const booksByAuthor = response.data; // Suponiendo que la respuesta contiene los libros del autor  

      if (booksByAuthor.length === 0) {  
          return res.status(404).json({ message: "No books found for this author." }); // Mensaje si no se encuentran libros  
      }  

      return res.status(200).json(booksByAuthor); // Enviar los libros encontrados como respuesta  
  } catch (error) {  
      console.error(`Error fetching books by author ${author}:`, error); // Registrar el error en la consola  
      return res.status(500).json({ message: "Error fetching books by author." }); // Mensaje de error  
  }  
}); 
// Endpoint para obtener los detalles de libros basados en el título  
router.get("/books/title/:title", async (req, res) => {  
  const { title } = req.params; // Obtener el título del libro de los parámetros de la solicitud  

  try {  
      const response = await axios.get(`URL_DEL_SERVICIO_API_LIBROS?title=${encodeURIComponent(title)}`); // Ajustar la URL según tu API  
      const booksByTitle = response.data; // Suponiendo que la respuesta contiene los libros con el título proporcionado  

      if (booksByTitle.length === 0) {  
          return res.status(404).json({ message: "No books found with this title." }); // Mensaje si no se encuentran libros  
      }  

      return res.status(200).json(booksByTitle); // Enviar los libros encontrados como respuesta  
  } catch (error) {  
      console.error(`Error fetching books with title ${title}:`, error); // Registrar el error en la consola  
      return res.status(500).json({ message: "Error fetching books by title." }); // Mensaje de error  
  }  
});  
// Register a new user  
public_users.post('/register', function (req, res) {  
    const { username, password } = req.body; // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud  

    // Verificar si el nombre de usuario o la contraseña están vacíos  
    if (!username || !password) {  
        return res.status(400).json({ message: "Username and password are required!" });  
    }  

    // Verificar si el nombre de usuario ya existe  
    const userExists = users.some(user => user.username === username);  
    if (userExists) {  
        return res.status(400).json({ message: "Username already exists!" });  
    }  

    // Si el nombre de usuario es único, agregar el nuevo usuario al arreglo  
    users.push({ username, password });  
    res.status(201).json({ message: "User registered successfully!", user: { username } });  
});


// Get the book list available in the shop  
public_users.get('/', function (req, res) {  
    res.send(JSON.stringify(books, null, 4)); // Convertir el objeto a JSON y formatear la salida  
});
// Get book details based on ISBN  
public_users.get('/isbn/:isbn', function (req, res) {  
    const isbn = req.params.isbn; // Recuperar el ISBN de los parámetros de la solicitud  
    const book = books[isbn]; // Buscar el libro por el ISBN  

    if (book) { // Comprobar si se ha encontrado el libro  
        res.send(JSON.stringify(book, null, 4)); // Devolver el libro en formato JSON  
    } else {  
        res.status(404).json({ message: "Book not found!" }); // Manejo del error si no se encuentra el libro  
    }  
});
// Get books details based on author  
public_users.get('/author/:author', function (req, res) {  
    const author = req.params.author; // Obtener el autor de los parámetros de la solicitud  
    const booksByAuthor = []; // Array para almacenar los libros encontrados del autor  

    // Iterar a través de las claves del objeto 'books'  
    for (const key in books) {  
        if (books[key].author === author) {  
            booksByAuthor.push(books[key]); // Agregar el libro al array si el autor coincide  
        }  
    }  

    // Verificar si se encontraron libros del autor  
    if (booksByAuthor.length > 0) {  
        res.send(JSON.stringify(booksByAuthor, null, 4)); // Devolver los libros en formato JSON  
    } else {  
        res.status(404).json({ message: "No books found for this author!" }); // Manejo del error si no se encuentra el autor  
    }  
});
// Get books details based on title  
public_users.get('/title/:title', function (req, res) {  
    const title = req.params.title; // Obtener el título de los parámetros de la solicitud  
    const booksByTitle = []; // Array para almacenar los libros encontrados con el título  

    // Iterar a través de las claves del objeto 'books'  
    for (const key in books) {  
        if (books[key].title.toLowerCase() === title.toLowerCase()) {  
            booksByTitle.push(books[key]); // Agregar el libro al array si el título coincide  
        }  
    }  

    // Verificar si se encontraron libros con el título  
    if (booksByTitle.length > 0) {  
        res.send(JSON.stringify(booksByTitle, null, 4)); // Devolver los libros en formato JSON  
    } else {  
        res.status(404).json({ message: "No books found with this title!" }); // Manejo del error si no se encuentra el título  
    }  
});
// Get reviews based on ISBN  
public_users.get('/review/:isbn', function (req, res) {  
    const isbn = req.params.isbn; // Obtener el ISBN de los parámetros de la solicitud  
    const book = books[isbn]; // Buscar el libro usando el ISBN  

    // Verificar si el libro existe y si tiene reseñas  
    if (book) {  
        if (Object.keys(book.reviews).length > 0) {  
            res.send(JSON.stringify(book.reviews, null, 4)); // Devolver las reseñas en formato JSON  
        } else {  
            res.status(404).json({ message: "No reviews found for this book!" }); // Manejo del error si no hay reseñas  
        }  
    } else {  
        res.status(404).json({ message: "Book not found!" }); // Manejo del error si no se encuentra el libro  
    }  
});

module.exports.general = public_users;