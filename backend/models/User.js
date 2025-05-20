const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['creditCard', 'debitCard', 'upi', 'paypal', 'cod'],
    required: true
  },
  cardName: String,
  cardNumber: String,
  expDate: String,
  upiId: String,
  paypalEmail: String,
  phoneNumber: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const laundryPreferencesSchema = new mongoose.Schema({
  detergent: {
    type: String,
    enum: ['regular', 'mild', 'hypoallergenic', 'eco-friendly', 'scent-free'],
    default: 'regular'
  },
  fabricSoftener: {
    type: Boolean,
    default: true
  },
  washTemperature: {
    type: String,
    enum: ['cold', 'warm', 'hot'],
    default: 'warm'
  },
  foldingPreference: {
    type: String,
    enum: ['folded', 'hangers', 'both'],
    default: 'folded'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  stainTreatment: {
    type: Boolean,
    default: true
  },
  ironingPreference: {
    type: Boolean,
    default: false
  },
  deliveryTimePreference: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'any'],
    default: 'any'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  profileImage: {
    type: String,
    default: null
  },
  paymentMethods: [paymentMethodSchema],
  laundryPreferences: {
    type: laundryPreferencesSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 