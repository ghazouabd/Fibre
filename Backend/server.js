require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const app = express();


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
  Hostname: { type: String, required: true, default :"---------" },
  Ipadress: { type: String, required: true, default :"0.0.0.0" },
  
});





const ClientInfoSchema = new mongoose.Schema({
  createdBy: {  // User qui a créé cette entrée
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  language: { type: String, default: 'English' },
  timezone: { type: String, default: 'GMT' },
  units: { type: String, default: 'Metric' },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  trapAddress: { type: String, default: '' },
  httpUrl: { type: String, default: '' },
  userRights: { type: String, default: 'View', enum: ['View', 'Edit'] }
}, { timestamps: true });

const ClientInfo = mongoose.model('ClientInfo', ClientInfoSchema);





const EMSConfigSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
  },
  ems_ip: String,
  ems_freq: String,
  ems_network: String,
  email_ip: String,
  email_port: String,
  email_protocol: String,
  sender_email: String,
  auth_required: Boolean,
  email_user: String,
  email_password: String,
  updatedAt: {
      type: Date,
      default: Date.now
  }
});
const EMSConfig = mongoose.model('EMSConfig', EMSConfigSchema);






// Schéma NetworkConfig
const NetworkConfigSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
  },
  // Rear Ethernet Adapter
  fixedAddress: { type: Boolean, default: false },
  rearIp: String,
  rearSubnet: String,
  rearGateway: String,
  rearMac: String,
  rearPrimaryDns: String,
  rearSecondaryDns: String,
  
  // Local Access Port
  localIp: String,
  localSubnet: String,
  localMac: String,
  
  // EMS Server Configuration
  emsHost: String,
  emsFrequency: Number,
  emsTopology: String,
  
  // Email Server Configuration
  emailHost: String,
  emailPort: Number,
  serverType: String,
  emailSender: String,
  authRequired: Boolean,
  emailUser: String,
  emailPassword: String,
  
  updatedAt: {
      type: Date,
      default: Date.now
  }
});

const NetworkConfig = mongoose.model('NetworkConfig', NetworkConfigSchema);








const ThresholdConfigSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
  },
  name: String,
  comments: String,
  sectionLoss: String,
  reflectanceDegradation: String,
  eventLoss: String,
  injectionLevel: String,
  linkTotalLoss: String,
  updatedAt: {
      type: Date,
      default: Date.now
  }
});
const ThresholdConfig = mongoose.model('ThresholdConfig', ThresholdConfigSchema);









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
        Ipadress: user.Ipadress,
        Hostname: user.Hostname,
       
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
    const { Hostname, Ipadress } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mise à jour des champs (supprimez la condition admin)
    user.Ipadress = Ipadress || user.Ipadress;
    user.Hostname = Hostname || user.Hostname;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        Ipadress: user.Ipadress,
        Hostname: user.Hostname,
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












app.post('/api/client-info', authMiddleware, async (req, res) => {
  try {
    const clientData = {
      createdBy: req.user.id,
      ...req.body
    };

    const clientInfo = new ClientInfo(clientData);
    await clientInfo.save();

    res.json({
      success: true,
      message: 'Client information added successfully',
      clientInfo
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding client information',
      error: error.message 
    });
  }
});

// Route pour récupérer tous les clients d'un utilisateur
app.get('/api/client-info', authMiddleware, async (req, res) => {
  try {
    const clients = await ClientInfo.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      clients
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching client information',
      error: error.message 
    });
  }
});

// Route pour supprimer un client
app.delete('/api/client-info/:id', authMiddleware, async (req, res) => {
  try {
    const result = await ClientInfo.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.user.id 
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or not owned by user'
      });
    }

    res.json({
      success: true,
      message: 'Client information deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting client information',
      error: error.message 
    });
  }
});





















app.route('/api/ems-config')
    .get(authMiddleware, async (req, res) => {
        try {
            const config = await EMSConfig.findOne({ userId: req.user.id });
            if (!config) {
                return res.status(404).json({ message: 'No EMS configuration found' });
            }
            res.json(config);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching EMS configuration',
                error: error.message 
            });
        }
    })
    .post(authMiddleware, async (req, res) => {
        try {
            const existingConfig = await EMSConfig.findOne({ userId: req.user.id });
            if (existingConfig) {
                return res.status(400).json({ message: 'Configuration already exists. Use PUT to update.' });
            }

            const newConfig = new EMSConfig({
                userId: req.user.id,
                ...req.body
            });

            await newConfig.save();
            res.json({
                message: 'EMS configuration created successfully',
                config: newConfig
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error creating EMS configuration',
                error: error.message 
            });
        }
    })
    .put(authMiddleware, async (req, res) => {
        try {
            const updatedConfig = await EMSConfig.findOneAndUpdate(
                { userId: req.user.id },
                req.body,
                { new: true, upsert: true }
            );

            res.json({
                message: 'EMS configuration updated successfully',
                config: updatedConfig
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error updating EMS configuration',
                error: error.message 
            });
        }
    });








app.route('/api/network-config')
    .get(authMiddleware, async (req, res) => {
        try {
            const config = await NetworkConfig.findOne({ userId: req.user.id });
            if (!config) {
                return res.json({
                    success: true,
                    config: null
                });
            }
            res.json({
                success: true,
                config
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching network config',
                error: error.message
            });
        }
    })
    .post(authMiddleware, async (req, res) => {
        try {
            const existingConfig = await NetworkConfig.findOne({ userId: req.user.id });
            if (existingConfig) {
                return res.status(400).json({
                    success: false,
                    message: 'Config already exists. Use PUT to update.'
                });
            }

            const newConfig = new NetworkConfig({
                userId: req.user.id,
                ...req.body
            });
            await newConfig.save();

            res.json({
                success: true,
                message: 'Network config created successfully',
                config: newConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating network config',
                error: error.message
            });
        }
    })
    .put(authMiddleware, async (req, res) => {
        try {
            const updatedConfig = await NetworkConfig.findOneAndUpdate(
                { userId: req.user.id },
                req.body,
                { new: true, upsert: true }
            );

            res.json({
                success: true,
                message: 'Network config updated successfully',
                config: updatedConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating network config',
                error: error.message
            });
        }
    });








    // Ajoutez ces routes avec les autres routes
app.route('/api/threshold-config')
.get(authMiddleware, async (req, res) => {
    try {
        const config = await ThresholdConfig.findOne({ userId: req.user.id });
        if (!config) {
            return res.status(404).json({ message: 'No threshold configuration found' });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching threshold configuration',
            error: error.message 
        });
    }
})
.post(authMiddleware, async (req, res) => {
    try {
        const existingConfig = await ThresholdConfig.findOne({ userId: req.user.id });
        if (existingConfig) {
            return res.status(400).json({ message: 'Configuration already exists. Use PUT to update.' });
        }

        const newConfig = new ThresholdConfig({
            userId: req.user.id,
            ...req.body
        });

        await newConfig.save();
        res.json({
            message: 'Threshold configuration created successfully',
            config: newConfig
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating threshold configuration',
            error: error.message 
        });
    }
})
.put(authMiddleware, async (req, res) => {
    try {
        const updatedConfig = await ThresholdConfig.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, upsert: true }
        );

        res.json({
            message: 'Threshold configuration updated successfully',
            config: updatedConfig
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating threshold configuration',
            error: error.message 
        });
    }
});






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));