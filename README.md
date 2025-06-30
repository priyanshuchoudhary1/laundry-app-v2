# Laundry Service Management System

A full-stack web application for managing laundry services, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### User Features
- User authentication and authorization
- Service availability checker by pincode
- Online booking system
- Multiple payment methods (Credit Card, UPI, COD)
- Order tracking
- Customizable laundry preferences
- Review and feedback system
- Profile management

### Admin Features
- Dashboard with analytics
- User management
- Order management
- Staff management
- Payment tracking
- Review and feedback moderation
- Service management

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Context API for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://github.com/priyanshuchoudhary1/laundry-app-v2.git
cd laundry-app-v2
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a .env file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

## Project Structure

```
laundry-app-v2/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get all orders
- GET /api/orders/:id - Get order by ID
- PUT /api/orders/:id - Update order status

### Reviews
- POST /api/reviews - Submit review
- GET /api/reviews - Get all reviews
- PUT /api/reviews/:id - Update review status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Priyanshu Choudhary - priyanshuofficial504@gmail.com

Project Link: [https://github.com/priyanshuchoudhary1/laundry-app-v2](https://github.com/priyanshuchoudhary1/laundry-app-v2)

## Acknowledgments

- Material-UI for the component library
- React Icons for the icon set
- MongoDB for the database
- Express.js for the backend framework 
