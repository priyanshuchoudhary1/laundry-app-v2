const express = require('express');
const router = express.Router();

// GET order by id
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // In a real app, you would fetch the order from a database
    // Example: const order = await Order.findById(orderId);
    
    // For now, we'll return a mock response to indicate the API endpoint is working
    if (orderId && orderId.length === 6) {
      // Simulate database lookup delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock response for demonstration
      res.status(200).json({
        success: true,
        message: "Order found",
        data: {
          id: orderId,
          customerName: "John Doe",
          status: "In Progress",
          date: new Date().toISOString().split('T')[0],
          items: [
            { name: 'Regular Wash', quantity: 2, price: 100 },
            { name: 'Dry Clean', quantity: 1, price: 150 }
          ],
          totalAmount: 350,
          statusTimeline: [
            { status: 'Order Placed', date: '2023-08-25 09:30 AM', completed: true },
            { status: 'Pickup Scheduled', date: '2023-08-25 11:00 AM', completed: true },
            { status: 'Items Received', date: '2023-08-25 02:15 PM', completed: true },
            { status: 'Cleaning in Progress', date: '2023-08-26 10:00 AM', completed: false },
            { status: 'Quality Check', date: 'Pending', completed: false },
            { status: 'Out for Delivery', date: 'Pending', completed: false },
            { status: 'Delivered', date: 'Pending', completed: false }
          ]
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Order not found",
        error: `Order #${orderId} not found. Please check the order ID and try again.`
      });
    }
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