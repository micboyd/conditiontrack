const express = require('express');
const ConditioningSession = require('../../models/conditioning/ConditioningSession');

const router = express.Router();

// Create a new Conditioning Session
router.post('/', async (req, res) => {
    try {
        const newSession = new ConditioningSession(req.body);
        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing Conditioning Session
router.put('/:id', async (req, res) => {
    try {
        const updated = await ConditioningSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Conditioning session not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all conditioning sessions for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const sessions = await ConditioningSession.find({ userId: req.params.userId });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific conditioning session for a user by session ID
router.get('/:userId/:id', async (req, res) => {
    try {
        const session = await ConditioningSession.findOne({
            _id: req.params.id,
            userId: req.params.userId,
        });
        if (!session) return res.status(404).json({ error: 'Conditioning session not found for this user' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a conditioning session for a specific user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await ConditioningSession.findOneAndDelete({
            _id: req.params.id
        });
        if (!deleted) return res.status(404).json({ error: 'Conditioning session not found for this user' });
        res.json({ message: 'Conditioning session deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
