const express = require('express');
const router = express.Router();
const MealPlan = require('../../models/nutrition/MealPlan');

// Copy a week plan to another week
router.post('/copy', async (req, res) => {
	try {
		const { userId, fromWeekStart, toWeekStart } = req.body;
		const source = await MealPlan.findOne({ userId, weekStart: fromWeekStart });
		if (!source || source.entries.length === 0)
			return res.status(404).json({ message: 'No plan found for source week' });
		const copied = await MealPlan.findOneAndUpdate(
			{ userId, weekStart: toWeekStart },
			{ userId, weekStart: toWeekStart, entries: source.entries },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		res.json(copied);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET plan for a specific user + week
router.get('/:userId/:weekStart', async (req, res) => {
	try {
		const plan = await MealPlan.findOne({
			userId: req.params.userId,
			weekStart: req.params.weekStart,
		});
		res.json(plan || null);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Upsert plan (create or update by userId + weekStart)
router.post('/upsert', async (req, res) => {
	try {
		const { userId, weekStart, entries } = req.body;
		const plan = await MealPlan.findOneAndUpdate(
			{ userId, weekStart },
			{ userId, weekStart, entries },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		res.json(plan);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// DELETE a plan entirely
router.delete('/:id', async (req, res) => {
	try {
		await MealPlan.findByIdAndDelete(req.params.id);
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
