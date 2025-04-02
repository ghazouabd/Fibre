require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const app = express();
const Notification = require("./models/Notification");

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("MongoDB Connection Error:", err));

// Schéma User modifié avec les nouveaux champs
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, default: "000-000-0000" },
  address: { type: String, required: true, default: "Not specified" },
  userType: { 
    type: String, 
    required: true,
    enum: ['admin', 'manager', 'regular'],
    default: 'regular'
  }
});

const User = mongoose.model("User", UserSchema);

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
  // Vérifier le header Authorization
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extraire le token après 'Bearer '

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ..., userType: ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Route d'inscription
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer un nouvel utilisateur avec les valeurs par défaut
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      // Les autres champs prennent leurs valeurs par défaut
    });

    await user.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user", details: error.message });
  }
});

// Route de connexion
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ 
      id: user._id,
      userType: user.userType // Inclure le userType dans le token
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        userType: user.userType
      } 
    });
  } catch (error) {
    res.status(500).json({ error: "Error during login", details: error.message });
  }
});

// Route pour récupérer le profil utilisateur
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

// Route pour mettre à jour le profil utilisateur
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, address, userType } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mise à jour des champs (supprimez la condition admin)
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.userType = userType || user.userType; // Modifiable par tous

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        phoneNumber: user.phonePhone,
        address: user.address,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route protégée exemple
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});




app.use("/api/auth", router);





// Routes pour les notifications
app.post("/api/auth/notifications", authMiddleware, async (req, res) => {
  try {
    const { notificationType, parameters, schedule, severityThreshold } = req.body;
    
    // Validation basique
    if (!notificationType || !parameters) {
      return res.status(400).json({ message: "Notification type and parameters are required" });
    }

    const notification = new Notification({
      userId: req.user.id,
      notificationType,
      parameters,
      schedule: schedule || "24/7",
      severityThreshold: severityThreshold || "medium"
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/auth/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/auth/notifications/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));