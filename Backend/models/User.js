const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Hostname: { type: String, required: true, default :"---------" },
  Ipadress: { type: String, required: true, default :"0.0.0.0" },



});

module.exports = mongoose.model("User", UserSchema);
honeNumber