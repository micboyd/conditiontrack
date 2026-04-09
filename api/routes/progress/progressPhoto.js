const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary, storage } = require('../../cloudinary');
const ProgressPhoto = require('../../models/progress/ProgressPhoto');

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
});

// GET /:userId — get all photos for user, sorted by date descending
router.get('/:userId', async (req, res) => {
    try {
        const photos = await ProgressPhoto.find({ userId: req.params.userId })
            .sort({ date: -1 });
        res.json(photos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST / — upload single image + body fields
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const { userId, date, notes, weight } = req.body;

        if (!userId || !date) {
            return res.status(400).json({ error: 'userId and date are required' });
        }

        const imageUrl = req.file.secure_url || req.file.url || req.file.path;

        const photo = new ProgressPhoto({
            userId,
            imageUrl,
            date,
            notes: notes || '',
            weight: weight ? Number(weight) : undefined,
        });

        const saved = await photo.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /:id — delete from DB and Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        const photo = await ProgressPhoto.findById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Photo not found' });

        // Extract public_id from imageUrl: folder/filename (without extension)
        const urlParts = photo.imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const publicId = `${folder}/${filename}`;

        await cloudinary.uploader.destroy(publicId);
        await ProgressPhoto.findByIdAndDelete(req.params.id);

        res.json({ message: 'Photo deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
