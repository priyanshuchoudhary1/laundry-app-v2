const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, adminCode } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is an admin registration
    const isAdmin = adminCode === 'ADMIN123'; // You can change this code to something more secure

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: isAdmin ? 'admin' : 'user'
    });

    await user.save();
    res.status(201).json({ 
      success: true,
      message: isAdmin ? 'Admin account created successfully' : 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to login as admin
    if (isAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      paymentMethods: user.paymentMethods,
      laundryPreferences: user.laundryPreferences,
      role: user.role || 'user'
    };

    res.json({ 
      success: true,
      message: 'Login successful', 
      token,
      userId: user._id,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update profile image
router.put('/profile-image/:id', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new payment method
router.post('/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, cardName, cardNumber, expDate, cvv, upiId, paypalEmail, phoneNumber } = req.body;

    // Validate required fields based on payment type
    if ((type === 'creditCard' || type === 'debitCard') && (!cardName || !cardNumber || !expDate)) {
      return res.status(400).json({ success: false, error: 'Missing required card details' });
    }

    if (type === 'upi' && !upiId) {
      return res.status(400).json({ success: false, error: 'UPI ID is required' });
    }

    if (type === 'paypal' && !paypalEmail) {
      return res.status(400).json({ success: false, error: 'PayPal email is required' });
    }

    if (type === 'cod' && !phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required for COD' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Create a new payment method based on type
    const newPaymentMethod = {
      type,
      isDefault: user.paymentMethods.length === 0 // Make default if first payment method
    };

    // Add type-specific fields
    if (type === 'creditCard' || type === 'debitCard') {
      newPaymentMethod.cardName = cardName;
      newPaymentMethod.cardNumber = cardNumber;
      newPaymentMethod.expDate = expDate;
    } else if (type === 'upi') {
      newPaymentMethod.upiId = upiId;
    } else if (type === 'paypal') {
      newPaymentMethod.paypalEmail = paypalEmail;
    } else if (type === 'cod') {
      newPaymentMethod.phoneNumber = phoneNumber;
    }

    // Add the new payment method
    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    res.json({ 
      success: true, 
      message: 'Payment method added successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all payment methods for a user
router.get('/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('paymentMethods');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a payment method
router.delete('/payment-methods/:userId/:methodId', async (req, res) => {
  try {
    const { userId, methodId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find the payment method
    const paymentMethod = user.paymentMethods.id(methodId);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }

    // If this was the default payment method, set another one as default
    if (paymentMethod.isDefault && user.paymentMethods.length > 1) {
      const nextPaymentMethod = user.paymentMethods.find(method => method._id.toString() !== methodId);
      if (nextPaymentMethod) {
        nextPaymentMethod.isDefault = true;
      }
    }

    // Remove the payment method
    user.paymentMethods = user.paymentMethods.filter(method => method._id.toString() !== methodId);
    await user.save();

    res.json({ 
      success: true, 
      message: 'Payment method removed successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set default payment method
router.put('/payment-methods/:userId/:methodId/default', async (req, res) => {
  try {
    const { userId, methodId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find the payment method
    const paymentMethod = user.paymentMethods.id(methodId);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }

    // Set all payment methods to non-default
    user.paymentMethods.forEach(method => {
      method.isDefault = false;
    });

    // Set the selected payment method as default
    paymentMethod.isDefault = true;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Default payment method updated successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's laundry preferences
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('laundryPreferences');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      preferences: user.laundryPreferences || {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user's laundry preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    // Validate preferences
    const allowedFields = [
      'detergent', 
      'fabricSoftener', 
      'washTemperature', 
      'foldingPreference',
      'specialInstructions',
      'stainTreatment',
      'ironingPreference',
      'deliveryTimePreference'
    ];
    
    // Only extract allowed fields
    const validPreferences = {};
    allowedFields.forEach(field => {
      if (preferences[field] !== undefined) {
        validPreferences[field] = preferences[field];
      }
    });
    
    // Add updated timestamp
    validPreferences.updatedAt = Date.now();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { laundryPreferences: validPreferences },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Laundry preferences updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 