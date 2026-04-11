const express = require('express');
const DailyLog = require('../../models/nutrition/DailyLog');

const router = express.Router();

// Get all logs for a user for a given month
router.get('/:userId/month/:year/:month', async (req, res) => {
	try {
		const { userId, year, month } = req.params;
		const paddedMonth = String(month).padStart(2, '0');
		const prefix = `${year}-${paddedMonth}`;
		const logs = await DailyLog.find({ userId, date: { $regex: `^${prefix}` } });
		res.json(logs);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get today's log for a user — returns null (not 404) if none exists yet
router.get('/:userId/:date', async (req, res) => {
	try {
		const log = await DailyLog.findOne({
			userId: req.params.userId,
			date: req.params.date,
		});
		res.json(log || null);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create a new daily log
router.post('/', async (req, res) => {
	try {
		const log = new DailyLog(req.body);
		const saved = await log.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update an existing daily log (replace meals array)
router.put('/:id', async (req, res) => {
	try {
		const updated = await DailyLog.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true },
		);
		if (!updated) return res.status(404).json({ error: 'Daily log not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = router;
