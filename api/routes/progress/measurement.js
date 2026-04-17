const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../../cloudinary');
const Measurement = require('../../models/progress/Measurement');

const MAX_FILE_SIZE_MB = 25;
const MAX_PHOTOS = 3;
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

const toUrlArray = (files) =>
	(files || []).map(f => f.secure_url || f.url || f.path);

const toKeepArray = (raw) => {
	if (!raw) return [];
	return (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
};

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

// POST / — create (accepts multipart/form-data; up to 3 photos optional)
router.post('/', (req, res) => {
	upload.array('photos', MAX_PHOTOS)(req, res, async (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ error: `File too large. Max ${MAX_FILE_SIZE_MB}MB per photo.` });
			}
			return res.status(400).json({ error: err.message });
		}
		try {
			const { userId, date, weight, muscleMass, bodyFat, notes } = req.body;
			if (!userId || !date) {
				return res.status(400).json({ error: 'userId and date are required' });
			}
			const photoUrls = toUrlArray(req.files).slice(0, MAX_PHOTOS);
			const m = new Measurement({
				userId, date,
				weight:     parseNum(weight),
				muscleMass: parseNum(muscleMass),
				bodyFat:    parseNum(bodyFat),
				notes: notes || '',
				photoUrls,
			});
			const saved = await m.save();
			res.status(201).json(saved);
		} catch (saveErr) {
			res.status(500).json({ error: saveErr.message });
		}
	});
});

// PUT /:id — update
// Client sends keepPhotoUrls[] for existing photos to retain, plus new photo files.
// Final photoUrls = keepPhotoUrls + new uploads, capped at 3.
router.put('/:id', (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ error: 'Invalid ID' });
	}
	upload.array('photos', MAX_PHOTOS)(req, res, async (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ error: `File too large. Max ${MAX_FILE_SIZE_MB}MB per photo.` });
			}
			return res.status(400).json({ error: err.message });
		}
		try {
			const { date, weight, muscleMass, bodyFat, notes } = req.body;
			const keepUrls = toKeepArray(req.body.keepPhotoUrls);
			const newUrls  = toUrlArray(req.files);
			const photoUrls = [...keepUrls, ...newUrls].slice(0, MAX_PHOTOS);

			const update = {
				date,
				weight:     parseNum(weight),
				muscleMass: parseNum(muscleMass),
				bodyFat:    parseNum(bodyFat),
				notes: notes || '',
				photoUrls,
			};

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
