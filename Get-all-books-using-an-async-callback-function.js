app.get('/books-async', async (req, res) => {
    const booksPath = path.join(__dirname, 'books.json');
    try {
        const data = await fs.promises.readFile(booksPath, 'utf8');
        const books = JSON.parse(data);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read books data' });
    }
});