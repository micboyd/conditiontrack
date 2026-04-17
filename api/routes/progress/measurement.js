const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../../cloudinary');
const Measurement = require('../../models/progress/Measurement');

const MAX_FILE_SIZE_MB = 25;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
	storage,
	limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
			return cb(new Error(`"${file.originalname}" is not a supported format. Allowed: JPG, PNG, WEBP, GIF.`));
		}
		cb(null, true);
	},
});

const parseNum = (v) =>
	v !== undefined && v !== '' && v !== 'null' ? Number(v) : null;

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

// POST / — create (accepts multipart/form-data; photo field is optional)
router.post('/', (req, res) => {
	upload.single('photo')(req, res, async (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ error: `File too large. Max ${MAX_FILE_SIZE_MB}MB.` });
			}
			return res.status(400).json({ error: err.message });
		}
		try {
			const { userId, date, weight, muscleMass, bodyFat, notes } = req.body;
			if (!userId || !date) {
				return res.status(400).json({ error: 'userId and date are required' });
			}
			const photoUrl = req.file
				? (req.file.secure_url || req.file.url || req.file.path)
				: null;
			const m = new Measurement({
				userId, date,
				weight:     parseNum(weight),
				muscleMass: parseNum(muscleMass),
				bodyFat:    parseNum(bodyFat),
				notes: notes || '',
				photoUrl,
			});
			const saved = await m.save();
			res.status(201).json(saved);
		} catch (saveErr) {
			res.status(500).json({ error: saveErr.message });
		}
	});
});

// PUT /:id — update (optional new photo; pass removePhoto=true to clear existing)
router.put('/:id', (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ error: 'Invalid ID' });
	}
	upload.single('photo')(req, res, async (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ error: `File too large. Max ${MAX_FILE_SIZE_MB}MB.` });
			}
			return res.status(400).json({ error: err.message });
		}
		try {
			const { date, weight, muscleMass, bodyFat, notes, removePhoto } = req.body;
			const update = {
				date,
				weight:     parseNum(weight),
				muscleMass: parseNum(muscleMass),
				bodyFat:    parseNum(bodyFat),
				notes: notes || '',
			};
			if (req.file) {
				update.photoUrl = req.file.secure_url || req.file.url || req.file.path;
			} else if (removePhoto === 'true') {
				update.photoUrl = null;
			}
			const updated = await Measurement.findByIdAndUpdate(req.params.id, update, { new: true });
			if (!updated) return res.status(404).json({ error: 'Measurement not found' });
			res.json(updated);
		} catch (updateErr) {
			res.status(400).json({ error: updateErr.message });
		}
	});
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
