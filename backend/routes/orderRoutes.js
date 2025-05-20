const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create a new order
router.post('/', async (req, res) => {
  try {
    console.log('Received order creation request body:', req.body);
    const {
      userId,
      customerName,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      pickupDate,
      deliveryDate
    } = req.body;

    // Validate required fields
    if (!userId || !customerName || !items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined || !deliveryAddress || !paymentMethod) {
      console.error('Missing required fields in order creation request');
      return res.status(400).json({
        success: false,
        message: 'Missing required order information or invalid items data.'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.quantity || !item.price || !item.serviceType) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have name, quantity, price, and serviceType.'
        });
      }
    }

    // Generate a unique order ID
    const orderId = Math.floor(100000 + Math.random() * 900000).toString();

    // Create initial status timeline
    const statusTimeline = [
      {
        status: 'Order Placed',
        date: new Date().toLocaleString(),
        completed: true
      },
      {
        status: 'Pickup Scheduled',
        date: pickupDate ? new Date(pickupDate).toLocaleString() : 'Pending',
        completed: !!pickupDate
      },
      {
        status: 'Items Received',
        date: 'Pending',
        completed: false
      },
      {
        status: 'Cleaning in Progress',
        date: 'Pending',
        completed: false
      },
      {
        status: 'Quality Check',
        date: 'Pending',
        completed: false
      },
      {
        status: 'Out for Delivery',
        date: 'Pending',
        completed: false
      },
      {
        status: 'Delivered',
        date: deliveryDate ? new Date(deliveryDate).toLocaleString() : 'Pending',
        completed: !!deliveryDate
      }
    ];

    // Create initial order history
    const orderHistory = [
      {
        action: 'Created',
        timestamp: new Date(),
        details: 'Order was created',
        performedBy: 'System'
      }
    ];

    const order = new Order({
      orderId,
      userId,
      customerName,
      items: items.map(item => ({
        ...item,
        itemStatus: 'Pending' // Initialize item status
      })),
      totalAmount,
      deliveryAddress,
      paymentMethod,
      statusTimeline,
      orderHistory,
      pickupDate: pickupDate ? new Date(pickupDate) : undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
    });

    console.log('Attempting to save order:', order);
    await order.save();
    console.log('Order saved successfully:', order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get all orders for a user with filtering and sorting
router.get('/user/:userId', async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = req.query;
    
    // Build query
    let query = { userId: req.params.userId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .sort(sortOptions)
      .populate('userId', 'name email phone'); // Populate user details

    // Calculate additional statistics
    const stats = {
      total: orders.length,
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      statusCounts: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: orders,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      statusBreakdown: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
      serviceBreakdown: orders.reduce((acc, order) => {
        order.items.forEach(item => {
          acc[item.serviceType] = (acc[item.serviceType] || 0) + item.quantity;
        });
        return acc;
      }, {}),
      recentOrders: orders.slice(0, 5).map(order => ({
        orderId: order.orderId,
        date: order.createdAt,
        amount: order.totalAmount,
        status: order.status
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: `Order #${req.params.id} not found. Please check the order ID and try again.`
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Get order history for a user
router.get('/user/:userId/history', async (req, res) => {
  try {
    console.log('Fetching order history for user:', req.params.userId);
    
    const { startDate, endDate, status } = req.query;
    let query = { userId: req.params.userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    console.log('Query:', query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select('orderId status totalAmount createdAt updatedAt orderHistory statusTimeline items')
      .populate('userId', 'name email');

    console.log(`Found ${orders.length} orders`);

    // Format the response
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      currentStatus: order.statusTimeline.find(timeline => timeline.completed === false)?.status || 'Completed',
      history: order.orderHistory.map(history => ({
        action: history.action,
        timestamp: history.timestamp,
        details: history.details,
        performedBy: history.performedBy
      }))
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order history',
      error: error.message
    });
  }
});

// Update order status with history
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes, performedBy = 'System' } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update the status
    order.status = status;

    // Update the status timeline
    const currentTime = new Date().toLocaleString();
    const timeline = order.statusTimeline;
    
    // Find the current status in timeline and mark it as completed
    const currentStatusIndex = timeline.findIndex(item => item.status === status);
    if (currentStatusIndex !== -1) {
      timeline[currentStatusIndex].completed = true;
      timeline[currentStatusIndex].date = currentTime;
      timeline[currentStatusIndex].notes = notes || '';
    }

    // Mark all previous statuses as completed
    for (let i = 0; i < currentStatusIndex; i++) {
      timeline[i].completed = true;
    }

    // Add to order history
    order.orderHistory.push({
      action: 'Status Changed',
      details: `Status changed to ${status}${notes ? ` - ${notes}` : ''}`,
      performedBy
    });

    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// Cancel an order
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation if order is not delivered
    if (order.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      });
    }

    order.status = 'Cancelled';
    order.statusTimeline.push({
      status: 'Order Cancelled',
      date: new Date().toLocaleString(),
      completed: true
    });

    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
});

module.exports = router; 