const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyAuth, isAdmin } = require('../middleware/auth');

// Submit a review or feedback
router.post('/', async (req, res) => {
  try {
    const { type, name, email, rating, message } = req.body;
    
    const review = new Review({
      type,
      name,
      email,
      rating: type === 'review' ? rating : undefined,
      message
    });

    await review.save();
    
    res.status(201).json({
      success: true,
      message: type === 'review' ? 'Review submitted successfully' : 'Feedback submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error submitting review/feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review/feedback',
      error: error.message
    });
  }
});

// Get all reviews (admin only)
router.get('/admin', verifyAuth, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Get approved reviews for public display
router.get('/public', async (req, res) => {
  try {
    const reviews = await Review.find({
      type: 'review',
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Update review status (admin only)
router.put('/:id/status', verifyAuth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
      error: error.message
    });
  }
});

module.exports = router; 