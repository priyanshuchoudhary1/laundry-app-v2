import React, { useState, useEffect, useRef } from 'react';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [animateTimeline, setAnimateTimeline] = useState(false);
  const inputRef = useRef(null);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Effect to animate timeline after order details are loaded
  useEffect(() => {
    if (orderDetails) {
      // Short delay to allow order details to render before animating timeline
      setTimeout(() => {
        setAnimateTimeline(true);
      }, 500);
    } else {
      setAnimateTimeline(false);
    }
  }, [orderDetails]);

  const handleInputChange = (e) => {
    // Only allow numbers in the input
    const value = e.target.value.replace(/\D/g, '');
    setOrderId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    // Validate input
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOrderDetails(null);
    setAnimateTimeline(false);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Order not found');
      }
      
      setOrderDetails(data.data);
    } catch (err) {
      setError(err.message || 'Error fetching order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'In Progress':
        return 'status-progress';
      case 'Delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  const formatOrderId = (id) => {
    // Format to make it more readable with spaces
    if (id && id.length === 6) {
      return `${id.slice(0, 3)} ${id.slice(3)}`;
    }
    return id;
  };

  // Function to get emoji based on status
  const getStatusEmoji = (status) => {
    if (status.includes('Order Placed')) return '📝';
    if (status.includes('Pickup')) return '🚚';
    if (status.includes('Received')) return '📦';
    if (status.includes('Cleaning')) return '🧼';
    if (status.includes('Quality')) return '🔍';
    if (status.includes('Delivery')) return '🚚';
    if (status.includes('Delivered')) return '✅';
    return '🔄';
  };

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h1>Track Your Order</h1>
        <p>Enter your order ID to check the status of your laundry services and view the progress of your items.</p>
      </div>

      <div className="track-form-container">
        <form onSubmit={handleSubmit} className="track-form">
          <div className="input-group">
            <div className="input-wrapper">
              <label htmlFor="orderIdInput" className="input-label">Enter Your Order ID</label>
              <input
                id="orderIdInput"
                ref={inputRef}
                type="text"
                value={orderId}
                onChange={handleInputChange}
                placeholder="Enter your 6-digit order ID here"
                className="order-input"
                maxLength="6"
                aria-label="Order ID"
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="track-button" 
              disabled={isLoading || !orderId.trim()}
              aria-label="Track Order"
            >
              {isLoading ? (
                <span className="loading-text">
                  <span className="dot-animation">Searching</span>
                </span>
              ) : (
                'TRACK ORDER'
              )}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {orderDetails && (
          <div className="order-details">
            <div className="order-header">
              <div>
                <h2>Order #{formatOrderId(orderDetails.id)}</h2>
                <p className="order-date">Placed on: {orderDetails.date}</p>
              </div>
              <div className={`order-status ${getStatusClass(orderDetails.status)}`}>
                {orderDetails.status}
              </div>
            </div>

            <div className="order-info">
              <div className="info-section">
                <h3>Customer</h3>
                <p>{orderDetails.customerName}</p>
              </div>
              <div className="info-section">
                <h3>Total Amount</h3>
                <p>₹{orderDetails.totalAmount}</p>
              </div>
            </div>

            <div className="order-items">
              <h3>Items</h3>
              <div className="items-list">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="item">
                    <div className="item-name">{item.name} × {item.quantity}</div>
                    <div className="item-price">₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-timeline">
              <h3>Status Timeline</h3>
              <div className="timeline">
                {orderDetails.statusTimeline.map((step, index) => (
                  <div 
                    key={index} 
                    className={`timeline-item ${step.completed ? 'completed' : ''} ${animateTimeline ? 'animate' : ''}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="timeline-marker">
                      {step.completed ? '✓' : getStatusEmoji(step.status)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{step.status}</div>
                      <div className="timeline-date">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
  