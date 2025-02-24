const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    publicationDate: Date,
    fileUrl: String,
});

module.exports = mongoose.model('Book', bookSchema);
