const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TrainingBlock = require('../../models/training-blocks/TrainingBlock');

function overlaps(a, b) {
	const aEnd = a.endDate || '9999-12-31';
	const bEnd = b.endDate || '9999-12-31';
	return a.startDate <= bEnd && b.startDate <= aEnd;
}

// GET /:userId — all blocks for user, sorted by startDate descending
router.get('/:userId', async (req, res) => {
	try {
		const blocks = await TrainingBlock.find({ userId: req.params.userId })
			.sort({ startDate: -1 });
		res.json(blocks);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST / — create with overlap validation
router.post('/', async (req, res) => {
	try {
		const { userId, name, startDate, endDate, notes } = req.body;
		const existing = await TrainingBlock.find({ userId });
		const newBlock = { startDate, endDate: endDate || null };
		const conflict = existing.find(b => overlaps(newBlock, b));
		if (conflict) {
			return res.status(400).json({ message: `Dates overlap with existing block: "${conflict.name}"` });
		}
		const block = new TrainingBlock({ userId, name, startDate, endDate: endDate || null, notes });
		const saved = await block.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// PUT /:id — update with overlap validation (excludes self)
router.put('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ message: 'Invalid ID' });
	}
	try {
		const { name, startDate, endDate, notes } = req.body;
		const block = await TrainingBlock.findById(req.params.id);
		if (!block) return res.status(404).json({ message: 'Block not found' });

		const existing = await TrainingBlock.find({ userId: block.userId, _id: { $ne: block._id } });
		const updated = { startDate, endDate: endDate || null };
		const conflict = existing.find(b => overlaps(updated, b));
		if (conflict) {
			return res.status(400).json({ message: `Dates overlap with existing block: "${conflict.name}"` });
		}

		block.name = name;
		block.startDate = startDate;
		block.endDate = endDate || null;
		block.notes = notes ?? block.notes;
		const saved = await block.save();
		res.json(saved);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ message: 'Invalid ID' });
	}
	try {
		await TrainingBlock.findByIdAndDelete(req.params.id);
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
