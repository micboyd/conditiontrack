const express = require('express');
const mongoose = require('mongoose');
const WorkoutRecord = require('../../models/strength/WorkoutRecord');

const router = express.Router();

// Utility function for ID validation
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new WorkoutRecord
router.post('/', async (req, res) => {
    try {
        // Remove empty _id to avoid cast errors
        if (req.body._id === '') {
            delete req.body._id;
        }

        // If _id exists but is invalid, reject
        if (req.body._id && !isValidObjectId(req.body._id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const newWorkoutRecord = new WorkoutRecord(req.body);
        const savedWorkoutRecord = await newWorkoutRecord.save();

        res.status(201).json(savedWorkoutRecord);
        
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Update an existing WorkoutRecord
router.put('/:id', async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Also clean body._id to avoid overwriting errors
        if (req.body._id === '') {
            delete req.body._id;
        }

        const updated = await WorkoutRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: 'WorkoutRecord not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all user WorkoutRecords (filter by userId if needed)
router.get('/:userId', async (req, res) => {
    try {
        if (!isValidObjectId(req.params.userId)) {
            return res.status(400).json({ error: 'Invalid User ID format' });
        }

        const workoutRecords = await WorkoutRecord.find({ userId: req.params.userId });
        res.json(workoutRecords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read one WorkoutRecord by ID
router.get('/:id', async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const workoutRecord = await WorkoutRecord.findById(req.params.id);
        if (!workoutRecord) return res.status(404).json({ error: 'WorkoutRecord not found' });
        res.json(workoutRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a WorkoutRecord
router.delete('/:id', async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const deleted = await WorkoutRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'WorkoutRecord not found' });
        res.json({ message: 'WorkoutRecord deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;