const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    category: { type: String, default: '' }
});

module.exports = mongoose.model('Meal', mealSchema);