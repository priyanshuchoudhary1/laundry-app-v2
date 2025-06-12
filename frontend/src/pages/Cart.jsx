import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaShoppingBag, FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaPaypal, FaClock, FaExclamationCircle } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import '../styles/pages/Cart.css';

const Cart = () => {
  const { cartItems, deleteItem } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('low');
  const DELIVERY_CHARGE = 50;

  // Priority-based pricing and time multipliers
  const PRIORITY_OPTIONS = {
    high: {
      name: 'High Priority',
      timeMultiplier: 0.15, // 15% of normal time
      priceMultiplier: 1, // Fixed price
      maxTime: 10, // Maximum 10 hours
      description: 'Express delivery within 10 hours',
      features: [
        'Priority processing queue',
        'Express pickup within 1 hour',
        'Dedicated staff handling',
        'Real-time tracking & updates',
        'Free stain treatment',
        'Premium packaging'
      ],
      recommended: false,
      icon: '🚀',
      fixedCharge: 250 // Fixed charge of ₹250
    },
    medium: {
      name: 'Medium Priority',
      timeMultiplier: 0.4, // 40% of normal time
      priceMultiplier: 1, // Fixed price
      maxTime: 60, // Maximum 60 hours (2.5 days)
      description: 'Standard delivery within 2.5 days',
      features: [
        'Faster processing queue',
        'Regular pickup within 2 hours',
        'Standard tracking',
        'Basic stain treatment',
        'Standard packaging'
      ],
      recommended: true,
      icon: '⭐',
      fixedCharge: 150 // Fixed charge of ₹150
    },
    low: {
      name: 'Low Priority',
      timeMultiplier: 1, // Normal time
      priceMultiplier: 1, // Normal price
      maxTime: 120, // Maximum 120 hours (5 days)
      description: 'Regular delivery within 5 days',
      features: [
        'Standard processing queue',
        'Regular pickup within 4 hours',
        'Basic tracking',
        'Standard packaging'
      ],
      recommended: false,
      icon: '📦',
      fixedCharge: 0 // No extra charge for low priority
    }
  };

  // Delivery time estimates in hours for different categories
  const DELIVERY_TIME_ESTIMATES = {
    'daily': {
      processing: 8,    // 8 hours for washing and drying
      ironing: 3,      // 3 hours for ironing
      total: 11,       // Total time in hours
      bestTime: 'Next day morning' // Best delivery time
    },
    'ethnic': {
      processing: 16,   // 16 hours for washing and drying
      ironing: 6,      // 6 hours for ironing
      total: 22,       // Total time in hours
      bestTime: 'Next day evening' // Best delivery time
    },
    'woolen': {
      processing: 24,   // 24 hours for washing and drying
      ironing: 6,      // 6 hours for ironing
      total: 30,       // Total time in hours
      bestTime: '2 days' // Best delivery time
    },
    'household': {
      processing: 12,   // 12 hours for washing and drying
      ironing: 3,      // 3 hours for ironing
      total: 15,       // Total time in hours
      bestTime: 'Next day afternoon' // Best delivery time
    },
    'delicate': {
      processing: 16,   // 16 hours for washing and drying
      ironing: 4,      // 4 hours for ironing
      total: 20,       // Total time in hours
      bestTime: 'Next day evening' // Best delivery time
    }
  };

  useEffect(() => {
    calculateDeliveryTime();
  }, [cartItems, selectedPriority]);

  const calculateDeliveryTime = () => {
    if (cartItems.length === 0) {
      setDeliveryTime(null);
      return;
    }

    const priority = PRIORITY_OPTIONS[selectedPriority];

    // Calculate total processing and ironing time
    const totalTimes = cartItems.reduce((acc, item) => {
      const category = item.category.toLowerCase();
      const times = DELIVERY_TIME_ESTIMATES[category] || DELIVERY_TIME_ESTIMATES['daily'];
      
      return {
        processing: acc.processing + (times.processing * item.quantity),
        ironing: acc.ironing + (times.ironing * item.quantity),
        total: Math.max(acc.total, times.total),
        bestTime: times.bestTime
      };
    }, { processing: 0, ironing: 0, total: 0, bestTime: '' });

    // Apply priority multiplier and max time limit
    const maxTime = priority.maxTime;
    const processingTime = Math.min(totalTimes.processing * priority.timeMultiplier, maxTime * 0.6);
    const ironingTime = Math.min(totalTimes.ironing * priority.timeMultiplier, maxTime * 0.4);
    
    // Add pickup and delivery time based on priority
    const pickupDeliveryTime = selectedPriority === 'high' ? 1 : (selectedPriority === 'medium' ? 1.5 : 2);
    
    // Calculate final delivery time
    const finalTime = {
      processing: processingTime,
      ironing: ironingTime,
      pickupDelivery: pickupDeliveryTime,
      total: Math.ceil(processingTime + ironingTime + pickupDeliveryTime),
      bestTime: priority.description,
      features: priority.features,
      icon: priority.icon
    };

    setDeliveryTime(finalTime);
  };

  const getPriorityPrice = () => {
    const basePrice = getTotalCost();
    const priority = PRIORITY_OPTIONS[selectedPriority];
    
    // For high and medium priority, only add priority charge
    if (selectedPriority === 'high' || selectedPriority === 'medium') {
      return basePrice + priority.fixedCharge;
    }
    
    // For low priority, add delivery charge
    return basePrice + DELIVERY_CHARGE;
  };

  const getTotalAmount = () => {
    const subtotal = getTotalCost();
    const priority = PRIORITY_OPTIONS[selectedPriority];
    
    // If subtotal is less than 250, add delivery charge
    if (subtotal < 250) {
      return subtotal + DELIVERY_CHARGE;
    }
    
    // For high and medium priority, only add priority charge (no delivery charge)
    if (selectedPriority === 'high' || selectedPriority === 'medium') {
      return subtotal + priority.fixedCharge;
    }
    
    // For low priority, add delivery charge
    return subtotal + DELIVERY_CHARGE;
  };

  const formatDeliveryTime = (time) => {
    if (!time) return '';

    const formatHours = (hours) => {
      // Round to nearest hour
      const roundedHours = Math.round(hours);
      
      if (roundedHours < 24) {
        return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
      }
      const days = Math.floor(roundedHours / 24);
      const remainingHours = roundedHours % 24;
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
      return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    };

    const getDeliveryDate = (hours) => {
      const now = new Date();
      // Round hours to nearest hour for delivery time
      const roundedHours = Math.round(hours);
      const deliveryDate = new Date(now.getTime() + roundedHours * 60 * 60 * 1000);
      
      const options = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true 
      };
      
      return deliveryDate.toLocaleDateString('en-US', options);
    };

    return {
      processing: formatHours(time.processing),
      ironing: formatHours(time.ironing),
      pickupDelivery: formatHours(time.pickupDelivery),
      total: formatHours(time.total),
      bestTime: selectedPriority === 'high' || selectedPriority === 'medium' 
        ? `Expected by ${getDeliveryDate(time.total)}`
        : time.bestTime
    };
  };

  const getTotalCost = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleDeleteItem = (itemName, category) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      deleteItem(itemName, category);
    }
  };

  const getCartTitle = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    return `Your Cart (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`;
  };

  const getItemTotal = (price, quantity) => {
    return price * quantity;
  };

  const getFormattedPrice = (price) => {
    return `₹${price}`;
  };

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleProceedToCheckout = async () => {
    if (selectedPayment) {
      navigate('/basic-payment', { state: { paymentMethod: selectedPayment } });
    } else {
      const notification = document.createElement('div');
      notification.className = 'payment-notification';
      notification.textContent = 'Please select a payment method to proceed';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <Link to="/services" className="back-link">
          <FaArrowLeft /> Back to Services
        </Link>
        <div className="cart-title">
          <FaShoppingBag className="icon-bag" />
          <h1>{getCartTitle()}</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty!</p>
          <Link to="/services" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.name}-${item.category}-${index}`} className="cart-item">
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <div className="item-quantity">
                    <span>Quantity: {item.quantity}</span>
                  </div>
                </div>
                <div className="item-price-section">
                  <p className="item-price">{getFormattedPrice(getItemTotal(item.price, item.quantity))}</p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item.name, item.category)}
                    title="Remove item"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{getFormattedPrice(getTotalCost())}</span>
            </div>

            {getTotalCost() >= 250 && (
              <div className="priority-section">
                <h3>Delivery Priority</h3>
                <div className="priority-options">
                  {Object.entries(PRIORITY_OPTIONS).map(([key, option]) => (
                    <div 
                      key={key}
                      className={`priority-option ${selectedPriority === key ? 'selected' : ''}`}
                      onClick={() => setSelectedPriority(key)}
                    >
                      <div className="priority-header">
                        <input
                          type="radio"
                          name="priority"
                          checked={selectedPriority === key}
                          onChange={() => setSelectedPriority(key)}
                        />
                        <div className="priority-title">
                          <div className="priority-name-container">
                            <span className="priority-icon">{option.icon}</span>
                            <span className="priority-name">{option.name}</span>
                            {option.recommended && (
                              <span className="recommended-badge">Recommended</span>
                            )}
                          </div>
                          <span className="priority-time">{option.description}</span>
                        </div>
                      </div>
                      <div className="priority-details">
                        <ul className="priority-features">
                          {option.features.map((feature, index) => (
                            <li key={index}>
                              <FaExclamationCircle className="feature-icon" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {key !== 'low' && (
                          <div className="priority-price">
                            <span className="price-label">Extra Charge:</span>
                            <span className="price-value">
                              +{((option.priceMultiplier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getTotalCost() >= 250 && (
              <div className="summary-row priority-level">
                <span>Priority Level</span>
                <span className={`priority-badge ${selectedPriority}`}>
                  {PRIORITY_OPTIONS[selectedPriority].name}
                </span>
              </div>
            )}

            {(selectedPriority === 'low' || getTotalCost() < 250) && (
              <div className="summary-row">
                <span>Delivery Charges</span>
                <span>{getFormattedPrice(DELIVERY_CHARGE)}</span>
              </div>
            )}
            
            {selectedPriority !== 'low' && (
              <div className="summary-row priority-charge">
                <span>Priority Delivery Charge</span>
                <span>{getFormattedPrice(PRIORITY_OPTIONS[selectedPriority].fixedCharge)}</span>
              </div>
            )}
            {deliveryTime && (
              <div className="summary-row delivery-time">
                <div className="delivery-time-details">
                  <div className="time-header">
                    <FaClock className="time-icon" />
                    <span>Estimated Delivery Time</span>
                  </div>
                  <div className="time-breakdown">
                    <div className="time-item">
                      <span>Processing:</span>
                      <span>{formatDeliveryTime(deliveryTime).processing}</span>
                    </div>
                    <div className="time-item">
                      <span>Ironing:</span>
                      <span>{formatDeliveryTime(deliveryTime).ironing}</span>
                    </div>
                    <div className="time-item">
                      <span>Pickup & Delivery:</span>
                      <span>{formatDeliveryTime(deliveryTime).pickupDelivery}</span>
                    </div>
                    <div className="time-item best-time">
                      <span>Expected Delivery:</span>
                      <span>{formatDeliveryTime(deliveryTime).bestTime}</span>
                    </div>
                    <div className="time-item total">
                      <span>Total Processing Time:</span>
                      <span>{formatDeliveryTime(deliveryTime).total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>{getFormattedPrice(getTotalAmount())}</span>
            </div>
          </div>

          <div className="payment-methods-section">
            <div className="payment-header">
              <h3>Complete Your Payment</h3>
              <p>Select a payment method to proceed</p>
            </div>
            
            <div className="payment-methods">
              <button 
                className={`payment-method-btn ${selectedPayment === 'creditCard' ? 'active' : ''}`} 
                onClick={() => handlePaymentSelect('creditCard')}
              >
                <div className="payment-icon-wrapper credit-card">
                  <FaCreditCard className="payment-icon" />
                </div>
                <span>Credit Card</span>
                {selectedPayment === 'creditCard' && <div className="selected-indicator"></div>}
              </button>
              
              <button 
                className={`payment-method-btn ${selectedPayment === 'debitCard' ? 'active' : ''}`} 
                onClick={() => handlePaymentSelect('debitCard')}
              >
                <div className="payment-icon-wrapper debit-card">
                  <FaCreditCard className="payment-icon" />
                </div>
                <span>Debit Card</span>
                {selectedPayment === 'debitCard' && <div className="selected-indicator"></div>}
              </button>
              
              <button 
                className={`payment-method-btn ${selectedPayment === 'upi' ? 'active' : ''}`} 
                onClick={() => handlePaymentSelect('upi')}
              >
                <div className="payment-icon-wrapper upi">
                  <SiGooglepay className="payment-icon" />
                </div>
                <span>UPI</span>
                {selectedPayment === 'upi' && <div className="selected-indicator"></div>}
              </button>
              
              <button 
                className={`payment-method-btn ${selectedPayment === 'paypal' ? 'active' : ''}`} 
                onClick={() => handlePaymentSelect('paypal')}
              >
                <div className="payment-icon-wrapper paypal">
                  <FaPaypal className="payment-icon" />
                </div>
                <span>PayPal</span>
                {selectedPayment === 'paypal' && <div className="selected-indicator"></div>}
              </button>
              
              <button 
                className={`payment-method-btn ${selectedPayment === 'cod' ? 'active' : ''}`} 
                onClick={() => handlePaymentSelect('cod')}
              >
                <div className="payment-icon-wrapper cod">
                  <FaMoneyBillWave className="payment-icon" />
                </div>
                <span>Cash on Delivery</span>
                {selectedPayment === 'cod' && <div className="selected-indicator"></div>}
              </button>
            </div>
            
            {selectedPayment && (
              <div className="payment-info-box">
                <div className="payment-info-icon">
                  {selectedPayment === 'creditCard' && <FaCreditCard />}
                  {selectedPayment === 'debitCard' && <FaCreditCard />}
                  {selectedPayment === 'upi' && <SiGooglepay />}
                  {selectedPayment === 'paypal' && <FaPaypal />}
                  {selectedPayment === 'cod' && <FaMoneyBillWave />}
                </div>
                <div className="payment-info-text">
                  {selectedPayment === 'creditCard' && "Pay securely using your credit card. We accept Visa, Mastercard, and Apple Pay."}
                  {selectedPayment === 'debitCard' && "Pay directly from your bank account. We accept all major banks."}
                  {selectedPayment === 'upi' && "Pay instantly using your preferred UPI app like Google Pay, PhonePe, or Paytm."}
                  {selectedPayment === 'paypal' && "Pay through your PayPal account for safe and secure transactions globally."}
                  {selectedPayment === 'cod' && "Pay when your laundry is delivered. Cash and digital payments accepted on delivery."}
                </div>
                {selectedPayment === 'upi' && (
                  <div className="payment-providers">
                    <SiGooglepay className="provider-icon" />
                    <SiPhonepe className="provider-icon" />
                    <SiPaytm className="provider-icon" />
                  </div>
                )}
                {(selectedPayment === 'creditCard' || selectedPayment === 'debitCard') && (
                  <div className="payment-brands">
                    <div className="card-brand visa-card"></div>
                    <div className="card-brand mastercard-card"></div>
                    <div className="card-brand amex-card"></div>
                    {selectedPayment === 'debitCard' && <div className="card-brand rupay-card"></div>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="cart-actions">
            <Link to="/services" className="continue-shopping">
              Continue Shopping
            </Link>
            <button 
              className="checkout-btn"
              onClick={handleProceedToCheckout}
              disabled={!selectedPayment}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
