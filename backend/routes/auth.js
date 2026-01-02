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
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', register);

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

// NEW: Update Profile Route (protected)
router.put('/update-profile', protect, updateProfile);

// NEW: Change Password Route (protected)
router.put('/change-password', protect, changePassword);

// NEW: Delete Account Route (protected)
router.delete('/delete-account', protect, deleteAccount);

// Email Verification Route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.send('<h2 style="text-align:center;color:red;margin-top:100px;">Invalid verification link</h2>');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.send('<h2 style="text-align:center;color:red;margin-top:100px;">Invalid token</h2>');
    }

    if (user.isVerified) {
      return res.send('<h2 style="text-align:center;color:green;margin-top:100px;">Email already verified! You can login now.</h2>');
    }

    user.isVerified = true;
    await user.save();

    res.send(`
      <h2 style="text-align:center;color:green;margin-top:100px;">🎉 Email verified successfully!</h2>
      <p style="text-align:center;">You can now <a href="/login.html">login</a> with full access.</p>
    `);
  } catch (err) {
    res.send('<h2 style="text-align:center;color:red;margin-top:100px;">Link expired or invalid. Please register again.</h2>');
  }
});

module.exports = router;