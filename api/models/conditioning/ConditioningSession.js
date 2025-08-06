const mongoose = require('mongoose');

const conditioningSessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: Number, required: true, min: 1 }, // in minutes
    category: { type: String, required: true }, // e.g. HIIT, Cardio, Strength
    userId: { type: String, required: true }, // reference to user
}, {
    timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('ConditioningSession', conditioningSessionSchema);