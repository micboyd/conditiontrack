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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
