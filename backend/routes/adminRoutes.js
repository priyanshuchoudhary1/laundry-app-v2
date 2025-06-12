const express = require('express');
const router = express.Router();
const { verifyAuth, isAdmin } = require('../middleware/auth');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Order = require('../models/Order');
const Staff = require('../models/Staff');

// Get dashboard stats
router.get('/stats', verifyAuth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0)
      }
    });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalStaff = await Staff.countDocuments();
    const availableStaff = await Staff.countDocuments({ isAvailable: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        ordersToday,
        pendingOrders,
        totalStaff,
        availableStaff
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/users', verifyAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders
router.get('/orders', verifyAuth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Services Management
router.get('/services', verifyAuth, isAdmin, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/services', verifyAuth, isAdmin, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/services/:id', verifyAuth, isAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/services/:id', verifyAuth, isAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Payments Management
router.get('/payments', verifyAuth, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('orderId', 'orderNumber')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/payments/:id/status', verifyAuth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// User Management
router.put('/users/:id/block', verifyAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order Management
router.put('/orders/:id/status', verifyAuth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all staff members
router.get('/staff', verifyAuth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching staff data...');
    const staff = await Staff.find().sort({ createdAt: -1 });
    console.log('Staff data fetched:', staff);
    res.json({ 
      success: true, 
      staff,
      message: 'Staff data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching staff data:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.stack 
    });
  }
});

// Get detailed user order statistics
router.get('/user-stats/:userId', verifyAuth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all orders for the user
    const orders = await Order.find({ user: userId })
      .populate('items.service')
      .populate('payment');

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      paymentMethods: {},
      categoryStats: {},
      recentOrders: orders.slice(-5).map(order => ({
        id: order._id,
        date: order.createdAt,
        total: order.totalAmount,
        status: order.status,
        items: order.items.map(item => ({
          service: item.service.name,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    };

    // Calculate payment method distribution
    orders.forEach(order => {
      if (order.payment && order.payment.paymentMethod) {
        const method = order.payment.paymentMethod;
        stats.paymentMethods[method] = (stats.paymentMethods[method] || 0) + 1;
      }
    });

    // Calculate category distribution
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.service && item.service.category) {
          const category = item.service.category;
          if (!stats.categoryStats[category]) {
            stats.categoryStats[category] = {
              count: 0,
              totalAmount: 0,
              items: []
            };
          }
          stats.categoryStats[category].count += item.quantity;
          stats.categoryStats[category].totalAmount += (item.price * item.quantity);
          stats.categoryStats[category].items.push({
            service: item.service.name,
            quantity: item.quantity,
            price: item.price
          });
        }
      });
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router; 