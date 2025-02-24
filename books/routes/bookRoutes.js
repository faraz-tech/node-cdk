const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const Book = require('../models/Book');
const router = express.Router();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, author, publicationDate } = req.body;
        const file = req.file;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const data = await s3.upload(params).promise();

        const newBook = new Book({
            title,
            author,
            publicationDate,
            fileUrl: data.Location,
        });

        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

router.get('/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.json(book);
});

router.put('/:id', async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
});

router.delete('/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
});

module.exports = router;
