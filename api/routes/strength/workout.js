const express = require('express');
const Workout = require('../../models/strength/Workout');

const router = express.Router();

// Create a new Workout
router.post('/', async (req, res) => {
    try {
        const newWorkout = new Workout(req.body);
        const savedWorkout = await newWorkout.save();
        res.status(201).json(savedWorkout);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing Workout
router.put('/:id', async (req, res) => {
    try {
        const updated = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Workout not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all user Workout
router.get('/:userId', async (req, res) => {
    try {
        const workouts = await Workout.find();
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read one Workout by ID
router.get('/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) return res.status(404).json({ error: 'Workout not found' });
        res.json(workout);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an Workout
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Workout.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Workout not found' });
        res.json({ message: 'Workout deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;