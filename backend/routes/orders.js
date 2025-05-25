const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

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

module.exports = router; 