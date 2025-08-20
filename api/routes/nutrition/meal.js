const express = require('express');
const Meal = require('../../models/nutrition/Meal');

const router = express.Router();

// Create a new Meal
router.post('/', async (req, res) => {
    try {
        const newMeal = new Meal(req.body);
        const savedMeal = await newMeal.save();
        res.status(201).json(savedMeal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing Meal
router.put('/:id', async (req, res) => {
    try {
        const updated = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Meal not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all Meals
router.get('/:userId', async (req, res) => {
    try {
        const meals = await Meal.find();
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read one Meal by ID
router.get('/:id', async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        if (!meal) return res.status(404).json({ error: 'Meal not found' });
        res.json(meal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Meal
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Meal.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Meal not found' });
        res.json({ message: 'Meal deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;