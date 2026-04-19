const express = require('express');
const mongoose = require('mongoose');
const Goal = require('../../models/goals/Goal');

const router = express.Router();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST / — create a goal
router.post('/', async (req, res) => {
	try {
		if (req.body._id === '') delete req.body._id;
		const goal = new Goal(req.body);
		const saved = await goal.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// PUT /:id — update a goal (also used to mark complete)
router.put('/:id', async (req, res) => {
	try {
		if (!isValidId(req.params.id))
			return res.status(400).json({ error: 'Invalid ID format' });
		if (req.body._id === '') delete req.body._id;
		const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!updated) return res.status(404).json({ error: 'Goal not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// GET /:userId — goals for a user, filtered by status (default: active)
router.get('/:userId', async (req, res) => {
	try {
		if (!isValidId(req.params.userId))
			return res.status(400).json({ error: 'Invalid User ID' });
		const status = req.query.status || 'active';
		const goals = await Goal.find({
			userId: req.params.userId,
			status,
		}).sort({ createdAt: -1 });
		res.json(goals);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// DELETE /:id — delete a goal
router.delete('/:id', async (req, res) => {
	try {
		if (!isValidId(req.params.id))
			return res.status(400).json({ error: 'Invalid ID format' });
		const deleted = await Goal.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Goal not found' });
		res.json({ message: 'Goal deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
