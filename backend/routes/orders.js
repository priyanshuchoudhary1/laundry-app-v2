const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Staff = require('../models/Staff');
const { auth } = require('../middleware/auth');

// GET order by id
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Fetch the order from the database
    const order = await Order.findOne({ orderId: orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: `Order #${orderId} not found. Please check the order ID and try again.`
      });
    }

    // Format the response
    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.customerName,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      items: order.items,
      orderHistory: order.orderHistory,
      statusTimeline: order.statusTimeline
    };

    res.status(200).json({
      success: true,
      message: "Order found",
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: "An error occurred while fetching the order. Please try again."
    });
  }
});

// Assign staff to order
router.post('/assign-staff', auth, async (req, res) => {
  try {
    const { orderId, staffId, role } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update order with staff assignment
    order.assignedStaff[role] = staffId;
    order.assignmentHistory.push({
      staff: staffId,
      role,
      assignedAt: new Date()
    });

    // Update staff member's current assignments
    staff.currentAssignments += 1;
    await staff.save();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete order and update staff metrics
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update staff metrics
    if (order.assignedStaff.washer) {
      const washer = await Staff.findById(order.assignedStaff.washer);
      if (washer) {
        washer.completedOrders += 1;
        washer.currentAssignments -= 1;
        await washer.save();
      }
    }

    if (order.assignedStaff.delivery) {
      const delivery = await Staff.findById(order.assignedStaff.delivery);
      if (delivery) {
        delivery.completedOrders += 1;
        delivery.currentAssignments -= 1;
        await delivery.save();
      }
    }

    order.status = 'completed';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 