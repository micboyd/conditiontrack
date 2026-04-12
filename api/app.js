require('dotenv').config(); // must be first — loads .env before any other module reads process.env

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const exerciseRoutes = require('./routes/strength/exercise');
const workoutRoutes = require('./routes/strength/workout');
const workoutRecordRoutes = require('./routes/strength/workoutRecord');

const mealRoutes = require('./routes/nutrition/meal');
const dailyLogRoutes = require('./routes/nutrition/dailyLog');
const mealPlanRoutes = require('./routes/nutrition/mealPlan');

const conditionSessionRoutes = require('./routes/conditioning/conditioningSession');
const conditionRecordRoutes = require('./routes/conditioning/conditioningRecord');

const weekPlannerRoutes = require('./routes/week-planner/week');

const progressPhotoRoutes = require('./routes/progress/progressPhoto');
const measurementRoutes = require('./routes/progress/measurement');

const goalRoutes = require('./routes/goals/goal');
const trainingBlockRoutes = require('./routes/training-blocks/trainingBlock');

const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/strength/exercise', exerciseRoutes);
app.use('/api/strength/workout', workoutRoutes);
app.use('/api/strength/workout-record', workoutRecordRoutes);
app.use('/api/nutrition/meal', mealRoutes);
app.use('/api/nutrition/daily-log', dailyLogRoutes);
app.use('/api/nutrition/meal-plan', mealPlanRoutes);
app.use('/api/conditioning/conditioning-session', conditionSessionRoutes);
app.use('/api/conditioning/conditioning-record', conditionRecordRoutes);
app.use('/api/week-planner/week', weekPlannerRoutes);
app.use('/api/progress/photos', progressPhotoRoutes);
app.use('/api/progress/measurements', measurementRoutes);
app.use('/api/goals/goal', goalRoutes);
app.use('/api/training-blocks/training-block', trainingBlockRoutes);

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB connected');
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch(err => {
		console.error('MongoDB connection error:', err);
	});
