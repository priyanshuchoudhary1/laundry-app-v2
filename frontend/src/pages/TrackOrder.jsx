import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/pages/TrackOrder.css';

const TrackOrder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [animateTimeline, setAnimateTimeline] = useState(false);

  useEffect(() => {
    // If no order ID in location state, redirect back
    if (!location.state?.orderId) {
      navigate('/account', { state: { activeTab: 'orders' } });
      return;
    }

    fetchOrderDetails(location.state.orderId);
  }, [location.state?.orderId, navigate]);

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

  const fetchOrderDetails = async (orderId) => {
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

  if (isLoading) {
    return (
      <div className="track-order-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-order-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="back-button"
            onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="track-order-container">
        <div className="no-orders-message">
          <div className="no-orders-icon">📦</div>
          <h2>Order Not Found</h2>
          <p>The requested order could not be found.</p>
          <button 
            className="back-button"
            onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h1>Track Your Order</h1>
        <p>View the status and progress of your laundry services.</p>
      </div>

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

        <div className="track-order-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
  