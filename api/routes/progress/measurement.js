const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Measurement = require('../../models/progress/Measurement');

// GET /:userId — all measurements, sorted by date descending
router.get('/:userId', async (req, res) => {
	try {
		const measurements = await Measurement.find({ userId: req.params.userId })
			.sort({ date: -1 });
		res.json(measurements);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// POST / — create
router.post('/', async (req, res) => {
	try {
		const { userId, date, weight, muscleMass, bodyFat, notes } = req.body;
		if (!userId || !date) {
			return res.status(400).json({ error: 'userId and date are required' });
		}
		const m = new Measurement({
			userId,
			date,
			weight:     weight     !== undefined && weight     !== '' ? Number(weight)     : null,
			muscleMass: muscleMass !== undefined && muscleMass !== '' ? Number(muscleMass) : null,
			bodyFat:    bodyFat    !== undefined && bodyFat    !== '' ? Number(bodyFat)    : null,
			notes: notes || '',
		});
		const saved = await m.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// PUT /:id — update
router.put('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ error: 'Invalid ID' });
	}
	try {
		const { date, weight, muscleMass, bodyFat, notes } = req.body;
		const updated = await Measurement.findByIdAndUpdate(
			req.params.id,
			{
				date,
				weight:     weight     !== undefined && weight     !== '' ? Number(weight)     : null,
				muscleMass: muscleMass !== undefined && muscleMass !== '' ? Number(muscleMass) : null,
				bodyFat:    bodyFat    !== undefined && bodyFat    !== '' ? Number(bodyFat)    : null,
				notes: notes || '',
			},
			{ new: true },
		);
		if (!updated) return res.status(404).json({ error: 'Measurement not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ error: 'Invalid ID' });
	}
	try {
		await Measurement.findByIdAndDelete(req.params.id);
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
