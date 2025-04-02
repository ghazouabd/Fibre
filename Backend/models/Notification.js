const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    notificationType: { 
      type: String, 
      enum: ['email', 'sms'], 
      required: true 
    },
    parameters: { 
      type: String, 
      required: true 
    },
    schedule: { 
      type: String, 
      enum: ['24/7', 'working-hours', 'custom'], 
      default: '24/7' 
    },
    severityThreshold: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'], 
      default: 'medium' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  });
  
  const Notification = mongoose.model("Notification", NotificationSchema);