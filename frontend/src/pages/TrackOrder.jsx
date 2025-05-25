import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './TrackOrder.css';

const TrackOrder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [animateTimeline, setAnimateTimeline] = useState(false);
  const inputRef = useRef(null);

  // Set order ID from location state if available
  useEffect(() => {
    if (location.state && location.state.orderId) {
      setOrderId(location.state.orderId);
      // Automatically fetch order details if order ID is provided
      handleSubmit(new Event('submit'));
    }
  }, [location.state]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current && !location.state?.orderId) {
      inputRef.current.focus();
    }
  }, [location.state]);

  // Effect to animate timeline after order details are loaded
  useEffect(() => {
    if (orderDetails) {
      setTimeout(() => {
        setAnimateTimeline(true);
      }, 500);
    } else {
      setAnimateTimeline(false);
    }
  }, [orderDetails]);

  const handleInputChange = (e) => {
    setOrderId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOrderDetails(null);
    setAnimateTimeline(false);

    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Order not found');
      }
      
      if (data.success) {
        // Transform the data to match our frontend format
        const orderWithHistory = {
          _id: data.data.orderId,
          customerName: data.data.customerName,
          status: data.data.status,
          createdAt: data.data.createdAt,
          totalAmount: data.data.totalAmount,
          items: data.data.items,
          history: data.data.orderHistory.map(history => ({
            action: history.action,
            timestamp: history.timestamp,
            details: history.details,
            completed: true
          })),
          statusTimeline: data.data.statusTimeline.map(timeline => ({
            action: timeline.status,
            timestamp: new Date(timeline.date).getTime(),
            completed: timeline.completed,
            details: timeline.notes || ''
          }))
        };
        setOrderDetails(orderWithHistory);
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError(err.message || 'Error fetching order. Please try again.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'order placed':
        return 'status-scheduled';
      case 'in progress':
      case 'washing':
      case 'ironing':
      case 'quality check':
      case 'pickup scheduled':
      case 'items received':
        return 'status-progress';
      case 'packaging':
      case 'out for delivery':
        return 'status-progress';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusEmoji = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('placed')) return '📝';
    if (statusLower.includes('pickup')) return '🚚';
    if (statusLower.includes('received')) return '📦';
    if (statusLower.includes('washing')) return '🧼';
    if (statusLower.includes('ironing')) return '👔';
    if (statusLower.includes('quality')) return '🔍';
    if (statusLower.includes('packaging')) return '📦';
    if (statusLower.includes('delivery')) return '🚚';
    if (statusLower.includes('delivered')) return '✅';
    if (statusLower.includes('cancelled')) return '❌';
    return '🔄';
  };

  const getStatusDetails = (status, orderDetails) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('washing')) {
      return `Washing ${orderDetails.items.length} items`;
    }
    if (statusLower.includes('ironing')) {
      return `Ironing ${orderDetails.items.length} items`;
    }
    if (statusLower.includes('quality')) {
      return 'Quality check in progress';
    }
    if (statusLower.includes('packaging')) {
      return 'Items being packaged for delivery';
    }
    if (statusLower.includes('delivery')) {
      return 'Out for delivery';
    }
    return '';
  };

  const renderNoOrders = () => (
    <div className="no-orders-message">
      <div className="no-orders-icon">��</div>
      <h2>No Orders Found</h2>
      <p>You haven't placed any orders yet or the order ID is incorrect.</p>
      <div className="no-orders-actions">
        <button onClick={() => navigate('/services')} className="browse-services-btn">
          Browse Services
        </button>
      </div>
    </div>
  );

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
                placeholder="Enter your order ID here"
                className="order-input"
                maxLength="24"
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

        {orderDetails ? (
          <div className="order-details">
            <div className="order-header">
              <div>
                <h2>Order #{orderDetails._id}</h2>
                <p className="order-date">Placed on: {formatDate(orderDetails.createdAt)}</p>
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
                    <div className="item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {orderDetails.history && orderDetails.history.length > 0 && (
              <div className="order-timeline">
                <h3>Status Timeline</h3>
                <div className="timeline">
                  {orderDetails.history.map((step, index) => (
                    <div 
                      key={index} 
                      className={`timeline-item ${step.completed ? 'completed' : ''} ${animateTimeline ? 'animate' : ''}`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="timeline-marker">
                        {step.completed ? '✓' : getStatusEmoji(step.action)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">{step.action}</div>
                        <div className="timeline-date">{formatDate(step.timestamp)}</div>
                        {step.details && (
                          <div className="timeline-details">{step.details}</div>
                        )}
                        {!step.details && (
                          <div className="timeline-details">
                            {getStatusDetails(step.action, orderDetails)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !isLoading && !error && renderNoOrders()}
      </div>
    </div>
  );
};

export default TrackOrder;
  