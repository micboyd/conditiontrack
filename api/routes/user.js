const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../cloudinary');

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	},
});

router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({
			_id: user._id,
			firstname: user.firstname,
			lastname: user.lastname,
			username: user.username,
			profileImage: user.profileImage,
			bio: user.bio,
			createdAt: user.createdAt,
			macroGoals: user.macroGoals,
			bmr: user.bmr,
			dailyDeficitTarget: user.dailyDeficitTarget,
			nutritionEnabled: user.nutritionEnabled,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put('/:id', upload.single('image'), async (req, res) => {
	try {
		const updateData = { ...req.body };

		if (req.file) {
			updateData.profileImage = req.file.secure_url || req.file.url || req.file.path;
		}

		const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
		if (!updated) return res.status(404).json({ error: 'User not found' });

		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = router;

