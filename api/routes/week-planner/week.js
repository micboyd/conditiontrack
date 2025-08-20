// routes/programming/weekPlan.js
const express = require('express');
const WeekPlan = require('../../models/week-planner/Week'); // adjust path if needed

const router = express.Router();

const POPULATE_PATHS = [{ path: 'days.workouts' }, { path: 'days.conditioning' }];

// Create a new WeekPlan (return populated)
router.post('/', async (req, res) => {
	try {
		const plan = await WeekPlan.create(req.body);
		const populated = await plan.populate(POPULATE_PATHS);
		res.status(201).json(populated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update an existing WeekPlan (return populated)
router.put('/:id', async (req, res) => {
	try {
		const updated = await WeekPlan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
			POPULATE_PATHS,
		);

		if (!updated) return res.status(404).json({ error: 'WeekPlan not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Read all WeekPlans for a user (always populated)
router.get('/:userId', async (req, res) => {
	try {
		const plans = await WeekPlan.find({ userId: req.params.userId }).populate(POPULATE_PATHS);
		res.json(plans);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Read one WeekPlan by ID (always populated)
router.get('/:id', async (req, res) => {
	try {
		const plan = await WeekPlan.findById(req.params.id).populate(POPULATE_PATHS);

		if (!plan) return res.status(404).json({ error: 'WeekPlan not found' });
		res.json(plan);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete a WeekPlan
router.delete('/:id', async (req, res) => {
	try {
		const deleted = await WeekPlan.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'WeekPlan not found' });
		res.json({ message: 'WeekPlan deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
