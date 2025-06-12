const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { verifyAuth, isAdmin } = require('../middleware/auth');

// Enable CORS for all staff routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Handle preflight requests
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

// Get all staff members (admin only)
router.get('/', verifyAuth, isAdmin, async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new staff member (admin only)
router.post('/', verifyAuth, isAdmin, async (req, res) => {
  const staff = new Staff({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    phone: req.body.phone
  });

  try {
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update staff member (admin only)
router.patch('/:id', verifyAuth, isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update only the fields that are provided
    const updateFields = ['name', 'role', 'email', 'phone', 'isAvailable'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    });

    const updatedStaff = await staff.save();
    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(400).json({ 
      message: 'Error updating staff member',
      error: error.message 
    });
  }
});

// Delete staff member (admin only)
router.delete('/:id', verifyAuth, isAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await staff.deleteOne();
    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get staff performance metrics (admin only)
router.get('/performance', verifyAuth, isAdmin, async (req, res) => {
  try {
    const performance = await Staff.aggregate([
      {
        $group: {
          _id: '$role',
          totalCompleted: { $sum: '$completedOrders' },
          totalAssignments: { $sum: '$currentAssignments' },
          averageCompleted: { $avg: '$completedOrders' }
        }
      }
    ]);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 