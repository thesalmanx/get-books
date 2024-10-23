app.get('/books-promise/:isbn', (req, res) => {
    const booksPath = path.join(__dirname, 'books.json');
    fs.promises.readFile(booksPath, 'utf8')
        .then(data => {
            const books = JSON.parse(data);
            const book = Object.values(books).find(b => b.isbn === req.params.isbn);
            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.json(book);
        })
        .catch(err => {
            res.status(500).json({ error: 'Failed to read books data' });
        });
}); 