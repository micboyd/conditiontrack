// routes/conditioning/conditioningRecordRoutes.js
const express = require('express');
const ConditioningRecord = require('../../models/conditioning/ConditioningRecord');

const router = express.Router();

// Create a new Conditioning Record
router.post('/', async (req, res) => {
	try {
		const newRecord = new ConditioningRecord(req.body);
		console.log(newRecord);
		const savedRecord = await newRecord.save();
		res.status(201).json(savedRecord);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update an existing Conditioning Record
router.put('/:id', async (req, res) => {
	try {
		const updated = await ConditioningRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ error: 'Conditioning record not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all conditioning records for a specific user
router.get('/:userId', async (req, res) => {
	try {
		const records = await ConditioningRecord.find({ userId: req.params.userId });
		res.json(records);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get a specific conditioning record for a user by record ID
router.get('/:userId/:id', async (req, res) => {
	try {
		const record = await ConditioningRecord.findOne({
			_id: req.params.id,
			userId: req.params.userId,
		});
		if (!record) return res.status(404).json({ error: 'Conditioning record not found for this user' });
		res.json(record);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Delete a conditioning record
router.delete('/:id', async (req, res) => {
	try {
		const deleted = await ConditioningRecord.findOneAndDelete({
			_id: req.params.id,
		});
		if (!deleted) return res.status(404).json({ error: 'Conditioning record not found' });
		res.json({ message: 'Conditioning record deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
