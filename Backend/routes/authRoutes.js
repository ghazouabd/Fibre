const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const authMiddleware = require("../middleware/auth");




// REGISTER (Sign Up)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email , phoneNumber: user.phoneNumber,
      address: user.address, userType: user.userType } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// PROTECTED ROUTE EXAMPLE (Requires Token)
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};





app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// UPDATE USER PROFILE (protégé par authMiddleware)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, address, userType } = req.body;
    const userId = req.user.id; // ID provenant du token

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mise à jour des champs
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    
    // Seul un admin peut modifier le userType
    if (req.user.userType === 'admin') {
      user.userType = userType || user.userType;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        phoneNumber: user.phoneNumber,
        address: user.address,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});






module.exports = router;