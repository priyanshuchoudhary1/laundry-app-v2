import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/pages/OrderConfirmation.css';

const OrderConfirmation = () => {
  const [orderId, setOrderId] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Get the order ID from the location state
    if (location.state && location.state.orderId) {
      setOrderId(location.state.orderId);
    }
  }, [location]);

  return (
    <div className="confirmation-container">
      <div className="confirmation-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h1>Order Confirmed!</h1>
      <p className="order-number">Order #<span>{orderId}</span></p>
      <p className="order-message">
        Thank you for your order. We've received your payment and your laundry service request has been confirmed.
      </p>
      
      <div className="order-details">
        <h2>What's Next?</h2>
        <ol>
          <li>We'll pick up your items at the scheduled time</li>
          <li>Your items will be professionally cleaned</li>
          <li>We'll deliver your fresh laundry back to you</li>
        </ol>
      </div>
      
      <div className="confirmation-actions">
        <Link to="/track-order" state={{ orderId }} className="action-button primary">
          Track Your Order
        </Link>
        <Link to="/" className="action-button secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 