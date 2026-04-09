const mongoose = require('mongoose');

const progressPhotoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    date: { type: String, required: true },
    notes: { type: String, default: '' },
    weight: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('ProgressPhoto', progressPhotoSchema);
