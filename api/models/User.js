const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	profileImage: { type: String, default: '' },
	bio: { type: String, default: '' },
	verified: { type: Boolean, default: false },
	verificationToken: { type: String, default: null },
	verificationExpiry: { type: Date, default: null },
	macroGoals: {
		calories: { type: Number, default: 0 },
		protein:  { type: Number, default: 0 },
		carbs:    { type: Number, default: 0 },
		fat:      { type: Number, default: 0 },
	},
	bmr: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
