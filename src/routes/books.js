const express = require('express');
const router = express.Router();
const BookModel = require('../models/book');

router.route('/')
    .get(async (req, res) => {
        try {
            const title = req.query.title;
            const category = req.query.category;
            const author = req.query.author;
            let query = {};
            if (title)
                query.title = new RegExp(title, 'i');
            if (category)
                query.category = new RegExp(category, 'i');
            if (author)
                query.author = new RegExp(author, 'i');

            if (Object.keys(query).length === 0)
                query = undefined;

            const results = await aggregate(query);
            res.json(results);
        } catch (e) {
            res.status(500).send({ message: e.message });
        }
    })
    .post(async (req, res) => {
        const book = new BookModel({
            title: req.body.title,
            category: req.body.category,
            author: req.body.author,
            publisher: req.body.publisher,
            publishDate: req.body.publishDate,
            overview: req.body.overview,
            numberOfPages: req.body.numberOfPages,
            imageUrls: req.body.imageUrLs
        });
        try {
            const newBook = await book.save();
            res.status(200).json(newBook);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

router.route('/:id')
    .get(getBookById, (req, res) => {
        res.json(res.book);
    })
    .patch(getBookById, async (req, res) => {
        const book = res.book;
        if (req.body.title)
            book.title = req.body.title;
        if (req.body.category)
            book.category = req.body.category;

        try {
            const updatedBook = await book.save();
            res.json(updatedBook);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    })
    .delete(getBookById, async (req, res) => {
        try {
            const book = res.book;
            await book.remove();
            res.send("Deleted book with title: " + book.title);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

async function getBookById(req, res, next) {
    let book;
    try {
        book = await BookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'book not found!' });
        }
        res.book = book;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next();
}

module.exports = router;