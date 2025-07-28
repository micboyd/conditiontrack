const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
