const express = require('express');
const multer = require('multer');
const mindee = require('mindee');
const Meal = require('../../models/nutrition/Meal');

const router = express.Router();

const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });

// Scan a nutrition label image and return extracted macros
router.post('/scan-label', (req, res) => {
    memUpload.single('image')(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'Image is required.' });

        try {
            const mimeToExt = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
            const ext = mimeToExt[req.file.mimetype] || 'jpg';
            const inputSource = new mindee.Base64Input({
                inputString: req.file.buffer.toString('base64'),
                filename: `label.${ext}`,
            });

            const response = await mindeeClient.enqueueAndGetResult(
                mindee.product.Extraction,
                inputSource,
                { modelId: process.env.MINDEE_MODEL_ID },
            );

            const fields = response.inference.result.fields;
            const perServing = (key) => fields.get(key)?.fields?.get('per_serving')?.value ?? null;
            const round = (v) => (v != null ? Math.round(v) : 0);

            res.json({
                calories: round(perServing('calories')),
                protein:  round(perServing('protein')),
                carbs:    round(perServing('total_carbohydrate')),
                fat:      round(perServing('total_fat')),
            });
        } catch (scanErr) {
            res.status(500).json({ error: scanErr.message });
        }
    });
});

// Create a new Meal
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        if (body.categories?.length) body.category = body.categories[0];
        const newMeal = new Meal(body);
        const savedMeal = await newMeal.save();
        res.status(201).json(savedMeal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing Meal
router.put('/:id', async (req, res) => {
    try {
        const body = req.body;
        if (body.categories?.length) body.category = body.categories[0];
        const updated = await Meal.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Meal not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all Meals for a user (with optional search, filter, pagination)
router.get('/user/:userId', async (req, res) => {
    try {
        const { search, category, calorieMin, calorieMax, page = 1, limit = 10 } = req.query;

        const filter = { userId: req.params.userId };

        if (search) filter.name = { $regex: search, $options: 'i' };
        if (category) filter.$or = [{ categories: category }, { category }];
        if (calorieMin || calorieMax) {
            filter.calories = {};
            if (calorieMin) filter.calories.$gte = Number(calorieMin);
            if (calorieMax) filter.calories.$lte = Number(calorieMax);
        }

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;

        const [rawMeals, total] = await Promise.all([
            Meal.find(filter).skip(skip).limit(limitNum),
            Meal.countDocuments(filter),
        ]);

        // Normalize legacy single-category field to array on read
        const meals = rawMeals.map(m => {
            const obj = m.toObject();
            if (obj.categories.length === 0 && obj.category) {
                obj.categories = [obj.category];
            }
            return obj;
        });

        res.json({ meals, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read one Meal by ID
router.get('/:id', async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        if (!meal) return res.status(404).json({ error: 'Meal not found' });
        res.json(meal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Meal
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Meal.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Meal not found' });
        res.json({ message: 'Meal deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;