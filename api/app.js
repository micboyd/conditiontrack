const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const exerciseRoutes = require('./routes/strength/exercise');
const workoutRoutes = require('./routes/strength/workout');

const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/strength/exercise', exerciseRoutes);
app.use('/api/strength/workout', workoutRoutes);

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
