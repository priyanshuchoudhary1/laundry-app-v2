const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'profile-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Hardcoded MongoDB URI (for testing purposes)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://priyanshu21134501025:90hhUVPcNDeCzTts@cluster0.cmxbjdv.mongodb.net/laundry';

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Special middleware for Stripe webhooks
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Retry connection after 5 seconds
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connect to MongoDB
connectDB();

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', paymentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Laundry App API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message 
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start server with error handling
const PORT = process.env.PORT || 4000;
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Frontend URLs allowed: http://localhost:3000, http://localhost:5173`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT); 