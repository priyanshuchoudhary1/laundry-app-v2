const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: [
      'manager',
      'cashier',
      'cleaning_person',
      'security_guard',
      'delivery_person',
      'washer',
      'ironer',
      'supervisor',
      'receptionist',
      'maintenance'
    ]
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  currentAssignments: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  performance: {
    tasksCompleted: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5.0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema); 