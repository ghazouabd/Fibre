const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, default: "00-000-000" }, // Valeur par défaut
  address: { type: String, required: true, default: "Not specified" }, // Valeur par défaut
  userType: { 
    type: String, 
    required: true,
    enum: ['admin', 'manager', 'regular'],
    default: 'admin' 
  }
});

module.exports = mongoose.model("User", UserSchema);