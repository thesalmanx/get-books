app.get('/books-async/title/:title', async (req, res) => {
    const booksPath = path.join(__dirname, 'books.json');
    try {
        const data = await fs.promises.readFile(booksPath, 'utf8');
        const books = JSON.parse(data);
        
        const title = req.params.title.toLowerCase();
        const filteredBooks = Object.values(books).filter(b =>
            b.title.toLowerCase().includes(title)
        );
        
        if (filteredBooks.length === 0) {
            return res.status(404).json({ error: 'No books found with this title' });
        }
        
        res.json(filteredBooks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read books data' });
    }
});