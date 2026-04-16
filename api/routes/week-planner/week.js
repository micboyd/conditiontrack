const express = require('express');
const WeekPlan = require('../../models/week-planner/Week');

const router = express.Router();

const POPULATE_PATHS = [
	{ path: 'days.workouts' },
	{ path: 'days.conditioning' },
	{ path: 'days.morning.workouts' },
	{ path: 'days.morning.conditioning' },
	{ path: 'days.afternoon.workouts' },
	{ path: 'days.afternoon.conditioning' },
	{ path: 'days.evening.workouts' },
	{ path: 'days.evening.conditioning' },
];

// Upsert a WeekPlan by userId + weekStart
router.post('/upsert', async (req, res) => {
	try {
		const { userId, weekStart, days } = req.body;
		const plan = await WeekPlan.findOneAndUpdate(
			{ userId, weekStart },
			{ userId, weekStart, days },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		).populate(POPULATE_PATHS);
		res.json(plan);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Copy one week's plan to another week
router.post('/copy', async (req, res) => {
	try {
		const { userId, fromWeekStart, toWeekStart } = req.body;
		const source = await WeekPlan.findOne({ userId, weekStart: fromWeekStart });
		if (!source) return res.status(404).json({ error: 'Source week plan not found' });

		const plan = await WeekPlan.findOneAndUpdate(
			{ userId, weekStart: toWeekStart },
			{ userId, weekStart: toWeekStart, days: source.days },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		).populate(POPULATE_PATHS);
		res.json(plan);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Create a new WeekPlan (legacy — kept for backwards compat)
router.post('/', async (req, res) => {
	try {
		const plan = await WeekPlan.create(req.body);
		const populated = await plan.populate(POPULATE_PATHS);
		res.status(201).json(populated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update an existing WeekPlan by ID
router.put('/:id', async (req, res) => {
	try {
		const updated = await WeekPlan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(POPULATE_PATHS);
		if (!updated) return res.status(404).json({ error: 'WeekPlan not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get a specific week's plan by userId + weekStart
router.get('/:userId/:weekStart', async (req, res) => {
	try {
		const plan = await WeekPlan.findOne({
			userId: req.params.userId,
			weekStart: req.params.weekStart,
		}).populate(POPULATE_PATHS);
		res.json(plan ?? null);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all plans for a user (legacy)
router.get('/:userId', async (req, res) => {
	try {
		const plans = await WeekPlan.find({ userId: req.params.userId }).populate(POPULATE_PATHS);
		res.json(plans[0] ?? null);
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
