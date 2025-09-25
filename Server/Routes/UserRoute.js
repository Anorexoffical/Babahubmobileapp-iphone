const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../Models/UserModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, dob, password } = req.body;
  console.log("Incoming body:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ name, email, dob, password });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob,
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
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials or role" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "password Incorrect" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dob: user.dob,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get customers (role: customer)
router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// forgot password route check the credentials
router.post("/forgot-password", async (req, res) => {
  const { email, dob } = req.body;
  console.log("Forgot password request:", req.body);

  try {
    // Check if fields are empty
    if (!email || !dob) {
      return res.status(400).json({ 
        message: "Please provide both email and date of birth" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "No account found with this email address" 
      });
    }

    // Check if DOB matches
    if (user.dob !== dob) {
      return res.status(400).json({ 
        message: "Date of birth does not match our records" 
      });
    }

    // If credentials are correct, allow password reset
    res.json({
      message: "Credentials verified successfully",
      success: true,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
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
    if (!user) {
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