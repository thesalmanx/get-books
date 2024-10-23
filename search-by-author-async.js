app.get('/books-async/author/:author', async (req, res) => {
    const booksPath = path.join(__dirname, 'books.json');
    try {
        const data = await fs.promises.readFile(booksPath, 'utf8');
        const books = JSON.parse(data);
        const booksByAuthor = Object.values(books).filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
        if (booksByAuthor.length === 0) {
            return res.status(404).json({ error: 'No books found by this author' });
        }
        res.json(booksByAuthor);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read books data' });
    }
});