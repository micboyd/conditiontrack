const express = require('express');
const WeekTemplate = require('../../models/week-planner/WeekTemplate');
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

const WEEK_POPULATE_PATHS = [
	{ path: 'days.workouts' },
	{ path: 'days.conditioning' },
	{ path: 'days.morning.workouts' },
	{ path: 'days.morning.conditioning' },
	{ path: 'days.afternoon.workouts' },
	{ path: 'days.afternoon.conditioning' },
	{ path: 'days.evening.workouts' },
	{ path: 'days.evening.conditioning' },
];

// Apply template to a specific week (must be before /:userId to avoid route conflict)
router.post('/apply', async (req, res) => {
	try {
		const { userId, templateId, weekStart } = req.body;
		const template = await WeekTemplate.findById(templateId);
		if (!template) return res.status(404).json({ error: 'Template not found' });

		const plan = await WeekPlan.findOneAndUpdate(
			{ userId, weekStart },
			{ userId, weekStart, days: template.days },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		).populate(WEEK_POPULATE_PATHS);
		res.json(plan);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get single template by ID (must be before /:userId)
router.get('/single/:id', async (req, res) => {
	try {
		const template = await WeekTemplate.findById(req.params.id).populate(POPULATE_PATHS);
		if (!template) return res.status(404).json({ error: 'Template not found' });
		res.json(template);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// List all templates for a user
router.get('/:userId', async (req, res) => {
	try {
		const templates = await WeekTemplate.find({ userId: req.params.userId })
			.populate(POPULATE_PATHS)
			.sort({ createdAt: -1 });
		res.json(templates);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create a template
router.post('/', async (req, res) => {
	try {
		const template = await WeekTemplate.create(req.body);
		const populated = await template.populate(POPULATE_PATHS);
		res.status(201).json(populated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update a template
router.put('/:id', async (req, res) => {
	try {
		const updated = await WeekTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(POPULATE_PATHS);
		if (!updated) return res.status(404).json({ error: 'Template not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete a template
router.delete('/:id', async (req, res) => {
	try {
		const deleted = await WeekTemplate.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Template not found' });
		res.json({ message: 'Template deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
