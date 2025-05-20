import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrderHistory();
  }, [user]);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`/api/orders/user/${user._id}/history`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch order history');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'In Progress': return 'status-progress';
      case 'Scheduled': return 'status-scheduled';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading order history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-history-container">
      <h1>Order History</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order.orderId}</div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="order-details">
                <div className="order-info">
                  <p>Date: {formatDate(order.createdAt)}</p>
                  <p>Amount: ₹{order.totalAmount}</p>
                  <p>Current Status: {order.currentStatus}</p>
                </div>

                <div className="order-timeline">
                  <h3>Order Timeline</h3>
                  <div className="timeline">
                    {order.history.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">{event.action}</div>
                          <div className="timeline-date">{formatDate(event.timestamp)}</div>
                          <div className="timeline-details">{event.details}</div>
                          <div className="timeline-performer">By: {event.performedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 