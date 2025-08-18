const express = require('express');
const Exercise = require('../../models/strength/Exercise');

const router = express.Router();

// Create a new Exercise
router.post('/', async (req, res) => {
    try {
        const newExercise = new Exercise(req.body);
        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing Exercise
router.put('/:id', async (req, res) => {
	try {
		const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ error: 'Exercise not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Read all user exercises
router.get('/:userId', async (req, res) => {
	try {
		const exercises = await Exercise.find();
		res.json(exercises);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Read one exercise by ID
router.get('/:id', async (req, res) => {
	try {
		const exercise = await Exercise.findById(req.params.id);
		if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
		res.json(exercise);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete an Exercise
router.delete('/:id', async (req, res) => {
	try {
		const deleted = await Exercise.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Exercise not found' });
		res.json({ message: 'Exercise deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;