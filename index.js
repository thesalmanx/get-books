const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get("/books", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }
    const books = JSON.parse(data);
    res.json(books);
  });
});

app.get("/books/:isbn", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }
    const books = JSON.parse(data);
    const book = Object.values(books).find((b) => b.isbn === req.params.isbn);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  });
});

app.get("/books/author/:author", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }
    const books = JSON.parse(data);
    const booksByAuthor = Object.values(books).filter(
      (b) => b.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (booksByAuthor.length === 0) {
      return res.status(404).json({ error: "No books found by this author" });
    }
    res.json(booksByAuthor);
  });
});

app.get("/books/title/:title", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }
    const books = JSON.parse(data);
    const booksByTitle = Object.values(books).filter((b) =>
      b.title.toLowerCase().includes(req.params.title.toLowerCase())
    );
    if (booksByTitle.length === 0) {
      return res.status(404).json({ error: "No books found with this title" });
    }
    res.json(booksByTitle);
  });
});

app.post("/books/:isbn/reviews", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  const { review } = req.body;
  const { isbn } = req.params;

  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }

    const books = JSON.parse(data);
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    book.reviews = book.reviews || [];
    book.reviews.push(review);

    fs.writeFile(booksPath, JSON.stringify(books, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save review" });
      }
      res
        .status(201)
        .json({ message: "Review added successfully", reviews: book.reviews });
    });
  });
});

app.put("/books/:isbn/reviews/:reviewId", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  const { isbn, reviewId } = req.params;
  const { review } = req.body;

  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }

    const books = JSON.parse(data);
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const id = parseInt(reviewId);
    if (id < 0 || id >= (book.reviews || []).length) {
      return res.status(404).json({ error: "Review not found" });
    }

    book.reviews[id] = review;

    fs.writeFile(booksPath, JSON.stringify(books, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save review" });
      }
      res.json({
        message: "Review modified successfully",
        reviews: book.reviews,
      });
    });
  });
});

app.delete("/books/:isbn/reviews/:reviewId", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  const { isbn, reviewId } = req.params;

  fs.readFile(booksPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read books data" });
    }

    const books = JSON.parse(data);
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const id = parseInt(reviewId);
    if (id < 0 || id >= (book.reviews || []).length) {
      return res.status(404).json({ error: "Review not found" });
    }

    book.reviews.splice(id, 1);
    fs.writeFile(booksPath, JSON.stringify(books, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save review" });
      }
      res.json({
        message: "Review deleted successfully",
        reviews: book.reviews,
      });
    });
  });
});

app.post("/register", (req, res) => {
  const usersPath = path.join(__dirname, "users.json");
  const newUser = req.body;

  fs.readFile(usersPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read users data" });
    }
    const users = JSON.parse(data);
    if (users[newUser.username]) {
      return res.status(400).json({ error: "User already exists" });
    }
    users[newUser.username] = newUser;
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save user data" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  });
});

app.post("/login", (req, res) => {
  const usersPath = path.join(__dirname, "users.json");
  const { username, password } = req.body;

  fs.readFile(usersPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read users data" });
    }
    const users = JSON.parse(data);
    const user = users[username];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    res.json({
      message: "Login successful",
      user: { username: user.username },
    });
  });
});

app.get("/books-async", async (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  try {
    const data = await fs.promises.readFile(booksPath, "utf8");
    const books = JSON.parse(data);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to read books data" });
  }
});

app.get("/books-promise/:isbn", (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  fs.promises
    .readFile(booksPath, "utf8")
    .then((data) => {
      const books = JSON.parse(data);
      const book = Object.values(books).find((b) => b.isbn === req.params.isbn);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to read books data" });
    });
});

app.get("/books-async/author/:author", async (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  try {
    const data = await fs.promises.readFile(booksPath, "utf8");
    const books = JSON.parse(data);
    const booksByAuthor = Object.values(books).filter(
      (b) => b.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (booksByAuthor.length === 0) {
      return res.status(404).json({ error: "No books found by this author" });
    }
    res.json(booksByAuthor);
  } catch (err) {
    res.status(500).json({ error: "Failed to read books data" });
  }
});

app.get("/books-async/title/:title", async (req, res) => {
  const booksPath = path.join(__dirname, "books.json");
  try {
    const data = await fs.promises.readFile(booksPath, "utf8");
    const books = JSON.parse(data);
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter((b) =>
      b.title.toLowerCase().includes(title)
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ error: "No books found with this title" });
    }

    res.json(filteredBooks);
  } catch (err) {
    res.status(500).json({ error: "Failed to read books data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
