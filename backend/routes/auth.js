const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { 
  register, 
  login, 
  getProfile, 
  forgotPassword, 
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', register);

// OTP Verification routes
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Login route
router.post('/login', login);

// Profile route (protected)
router.get('/profile', protect, getProfile);

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

// Forgot Password Route
router.post('/forgot', forgotPassword);

// Reset Password Route
router.post('/reset', resetPassword);

// Update Profile Route (protected)
router.put('/update-profile', protect, updateProfile);

// Change Password Route (protected)
router.put('/change-password', protect, changePassword);

// Delete Account Route (protected)
router.delete('/delete-account', protect, deleteAccount);

// Old Email Verification Route (kept for backward compatibility - can be removed)
router.get('/verify-email', async (req, res) => {
  res.send(`
    <h2 style="text-align:center;color:orange;margin-top:100px;">⚠️ This verification method is no longer used</h2>
    <p style="text-align:center;">Please use the OTP sent to your email to verify your account.</p>
    <p style="text-align:center;"><a href="/login.html">Go to Login</a></p>
  `);
});

module.exports = router;