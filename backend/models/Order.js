const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Delivered', 'Cancelled'],
    default: 'Scheduled'
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    category: String,
    serviceType: {
      type: String,
      enum: ['Wash', 'Dry Clean', 'Iron', 'Wash & Iron'],
      required: true
    },
    instructions: String,
    itemStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed'],
      default: 'Pending'
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  statusTimeline: [{
    status: String,
    date: String,
    completed: Boolean,
    notes: String
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  pickupDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  orderHistory: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Status Changed', 'Cancelled', 'Payment Updated'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String
    },
    performedBy: {
      type: String,
      default: 'System'
    }
  }],
  assignedStaff: {
    washer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  },
  priorityLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  assignmentHistory: [{
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    role: {
      type: String,
      enum: ['washer', 'delivery']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add to order history before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderHistory.push({
      action: 'Created',
      details: 'Order was created',
      performedBy: 'System'
    });
  } else if (this.isModified('status')) {
    this.orderHistory.push({
      action: 'Status Changed',
      details: `Status changed to ${this.status}`,
      performedBy: 'System'
    });
  }
  next();
});

// Add compound index for user and date queries
orderSchema.index({ userId: 1, createdAt: -1 });

// Add validation for order history
orderSchema.path('orderHistory').validate(function(history) {
  return Array.isArray(history);
}, 'Order history must be an array');

// Add validation for status timeline
orderSchema.path('statusTimeline').validate(function(timeline) {
  return Array.isArray(timeline);
}, 'Status timeline must be an array');

module.exports = mongoose.model('Order', orderSchema); 