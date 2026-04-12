const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');

const router = express.Router();

// Lazy-initialise so the server starts even if RESEND_API_KEY isn't set yet
function getResend() {
	if (!process.env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not set in your .env file.');
	}
	return new Resend(process.env.RESEND_API_KEY);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateVerificationEmail(firstname, verificationUrl) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your ConditionTrack account</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#18181b;border-radius:10px;padding:10px 12px;">
                    <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.3px;">⚡ ConditionTrack</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Welcome, ${firstname}! 👋
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">
                Thanks for signing up. Tap the button below to verify your email address and activate your account.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}"
                      style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:-0.2px;">
                      Verify my account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                This link expires in 24 hours. If you didn't create a ConditionTrack account, you can safely ignore this email.
              </p>

              <!-- Fallback URL -->
              <p style="margin:16px 0 0;font-size:12px;color:#d4d4d8;">
                Or copy and paste this link:<br/>
                <a href="${verificationUrl}" style="color:#71717a;word-break:break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;" align="center">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">© 2025 ConditionTrack. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Register ────────────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
	try {
		const { username, password, firstname, lastname } = req.body;

		if (!username || !password || !firstname || !lastname) {
			return res.status(400).json({ msg: 'All fields are required.' });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ msg: 'An account with this email already exists.' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate a secure verification token (expires in 24h)
		const verificationToken = crypto.randomBytes(32).toString('hex');
		const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

		const user = new User({
			firstname,
			lastname,
			username,
			password: hashedPassword,
			verified: false,
			verificationToken,
			verificationExpiry,
		});

		await user.save();

		// Send verification email via Resend
		const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
		const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

		await getResend().emails.send({
			from: process.env.RESEND_FROM_EMAIL || 'ConditionTrack <onboarding@resend.dev>',
			to: username, // username is the email address in this system
			subject: 'Verify your ConditionTrack account',
			html: generateVerificationEmail(firstname, verificationUrl),
		});

		res.status(201).json({ msg: 'Account created. Please check your email to verify your account.' });
	} catch (err) {
		console.error('Register error:', err);
		res.status(500).json({ error: err.message });
	}
});

// ─── Verify email ────────────────────────────────────────────────────────────

router.get('/verify-email', async (req, res) => {
	try {
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({ msg: 'Verification token is required.' });
		}

		const user = await User.findOne({
			verificationToken: token,
			verificationExpiry: { $gt: new Date() },
		});

		if (!user) {
			return res.status(400).json({ msg: 'This verification link is invalid or has expired.' });
		}

		user.verified = true;
		user.verificationToken = null;
		user.verificationExpiry = null;
		await user.save();

		res.json({ msg: 'Email verified successfully. You can now sign in.' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─── Resend verification email ───────────────────────────────────────────────

router.post('/resend-verification', async (req, res) => {
	try {
		const { username } = req.body;

		const user = await User.findOne({ username });
		if (!user) {
			// Don't reveal whether the account exists
			return res.json({ msg: 'If that account exists, a new verification email has been sent.' });
		}

		if (user.verified) {
			return res.status(400).json({ msg: 'This account is already verified.' });
		}

		// Generate a fresh token
		user.verificationToken = crypto.randomBytes(32).toString('hex');
		user.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
		await user.save();

		const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
		const verificationUrl = `${clientUrl}/verify-email?token=${user.verificationToken}`;

		await getResend().emails.send({
			from: process.env.RESEND_FROM_EMAIL || 'ConditionTrack <onboarding@resend.dev>',
			to: username,
			subject: 'Verify your ConditionTrack account',
			html: generateVerificationEmail(user.firstname, verificationUrl),
		});

		res.json({ msg: 'A new verification email has been sent.' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─── Login ───────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(400).json({ msg: 'Incorrect email or password.' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ msg: 'Incorrect email or password.' });
		}

		// Block unverified accounts (only for new accounts that have a verificationToken history)
		// undefined/null verified means it's an old account — allow through
		if (user.verified === false) {
			return res.status(403).json({
				msg: 'Please verify your email before signing in.',
				unverified: true,
			});
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

		res.json({ token, id: user._id });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
