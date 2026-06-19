const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require("../Models/UserModel");
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Incoming registration body:", { name, email });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.isDeleted) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role });
    console.log("Found user:", user);
    if (!user || user.isDeleted) {
      return res.status(400).json({ message: "This account doesn't exist." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "password Incorrect" });
    }

    // issue JWT
    const secret = process.env.JWT_SECRET || env.JWT_SECRET || 'secretkey';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get customers (role: customer)
router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer", isDeleted: { $ne: true } }).select("-password");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// forgot password route check the credentials
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log("Forgot password request (email-only):", { email });

  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      return res.status(400).json({ message: "No account found with this email address" });
    }

    // For a secure flow, a token/email should be sent. For now, acknowledge email-only verification.
    res.json({
      message: "Email verified. Proceed to reset via secure token (not implemented here).",
      success: true,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete (soft) account - protected
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const user = req.user; // from middleware

    // anonymize and soft-delete
    const originalEmail = user.email;
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.name = 'Deleted User';
    user.email = `deleted_${Date.now()}_${originalEmail}`;
    user.role = null;

    // Optionally clear other PII fields here if present
    await user.save();

    // Return success - frontend should sign out and clear local storage
    return res.json({ message: 'Account deleted successfully', success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// FIXED reset-password route - Let Mongoose handle the hashing
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  console.log("Reset password request received:", { 
    email: email, 
    hasPassword: !!newPassword 
  });

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ 
        message: "Email and new password are required",
        success: false
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long",
        success: false
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      return res.status(400).json({ 
        message: "User not found",
        success: false
      });
    }

    // ✅ CRITICAL FIX: Let Mongoose middleware handle the hashing
    user.password = newPassword;
    await user.save();

    console.log("Password reset successful for:", email);

    res.json({
      message: "Password reset successfully",
      success: true
    });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ 
      message: "Server error during password reset", 
      error: err.message,
      success: false
    });
  }
});

module.exports = router;