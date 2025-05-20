import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './BasicPayment.css';

const BasicPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    address: '',
    city: '',
    zipCode: '',
    upiId: '',
    phoneNumber: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');

  const DELIVERY_CHARGE = 50;

  // Set the payment method from the location state on component mount
  useEffect(() => {
    if (location.state && location.state.paymentMethod) {
      setPaymentMethod(location.state.paymentMethod);
    }
  }, [location.state]);

  const getTotalCost = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) + DELIVERY_CHARGE;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for card number - only allow numbers
    if (name === 'cardNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }
    
    // Special handling for CVV - only allow numbers
    if (name === 'cvv') {
      const numbersOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }
    
    // Special handling for expiry date - automatically add slash
    if (name === 'expDate') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    // Special handling for phone number - only allow numbers
    if (name === 'phoneNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }
    
    // Regular handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCardNumber = (number) => {
    // Basic validation - this could be enhanced with Luhn algorithm for real scenarios
    return number.length === 16;
  };

  const validateExpDate = (date) => {
    // Check format
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    
    const [month, year] = date.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    // Convert to numbers
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Check if month is valid
    if (monthNum < 1 || monthNum > 12) return false;
    
    // Check if card is expired
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return false;
    }
    
    return true;
  };

  const validateCVV = (cvv) => {
    // CVV is typically 3 or 4 digits
    return /^\d{3,4}$/.test(cvv);
  };

  const validateUpiId = (upiId) => {
    // Basic UPI ID validation
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Basic 10-digit phone number validation
    return /^\d{10}$/.test(phoneNumber);
  };

  const validateRequiredFields = () => {
    switch (paymentMethod) {
      case 'creditCard':
      case 'debitCard':
        if (!formData.cardName || !formData.cardNumber || !formData.expDate || !formData.cvv) {
          setError('Please fill all required payment fields');
          return false;
        }
        
        if (!validateCardNumber(formData.cardNumber)) {
          setError('Invalid card number. Please enter a valid 16-digit card number.');
          return false;
        }
  
        if (!validateExpDate(formData.expDate)) {
          setError('Invalid expiration date. Please use MM/YY format with a future date.');
          return false;
        }
  
        if (!validateCVV(formData.cvv)) {
          setError('Invalid CVV. Please enter a 3 or 4 digit security code.');
          return false;
        }
        break;
        
      case 'upi':
        if (!formData.upiId) {
          setError('Please enter your UPI ID');
          return false;
        }
        
        if (!validateUpiId(formData.upiId)) {
          setError('Please enter a valid UPI ID (e.g., name@bankname)');
          return false;
        }
        break;
        
      case 'cod':
        if (!formData.phoneNumber) {
          setError('Please enter your phone number for Cash on Delivery');
          return false;
        }
        
        if (!validatePhoneNumber(formData.phoneNumber)) {
          setError('Please enter a valid 10-digit phone number');
          return false;
        }
        
        if (!formData.address || !formData.city || !formData.zipCode) {
          setError('Please fill all delivery address fields');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    if (!user) {
      setError('Please login to continue');
      setIsProcessing(false);
      return;
    }

    // Validate form fields
    if (!validateRequiredFields()) {
      setIsProcessing(false);
      return;
    }

    try {
      // Create order data
      const orderData = {
        userId: user._id,
        customerName: user.name,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          serviceType: item.serviceType || 'Wash'
        })),
        totalAmount: getTotalCost(),
        deliveryAddress: {
          street: formData.address,
          city: formData.city,
          state: user.address?.state || '',
          pincode: formData.zipCode
        },
        paymentMethod: paymentMethod,
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      };

      // Create order in database
      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      // If order creation is successful
      setIsProcessing(false);
      setPaymentSuccess(true);
      clearCart();
      
      // Redirect after successful payment
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Transaction failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'creditCard':
        return (
          <div className="form-section">
            <h2>Credit Card Details</h2>
            <div className="form-group">
              <label htmlFor="cardName">Name on Card*</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isProcessing || paymentSuccess}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number*</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234567890123456"
                maxLength="16"
                disabled={isProcessing || paymentSuccess}
              />
              <div className="card-icons">
                <span className="card-icon visa"></span>
                <span className="card-icon mastercard"></span>
                <span className="card-icon amex"></span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expDate">Expiry Date*</label>
                <input
                  type="text"
                  id="expDate"
                  name="expDate"
                  value={formData.expDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  disabled={isProcessing || paymentSuccess}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV*</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  disabled={isProcessing || paymentSuccess}
                />
              </div>
            </div>
          </div>
        );
        
      case 'debitCard':
        return (
          <div className="form-section">
            <h2>Debit Card Details</h2>
            <div className="form-group">
              <label htmlFor="cardName">Name on Card*</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isProcessing || paymentSuccess}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number*</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234567890123456"
                maxLength="16"
                disabled={isProcessing || paymentSuccess}
              />
              <div className="card-icons">
                <span className="card-icon visa"></span>
                <span className="card-icon mastercard"></span>
                <span className="card-icon rupay"></span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expDate">Expiry Date*</label>
                <input
                  type="text"
                  id="expDate"
                  name="expDate"
                  value={formData.expDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  disabled={isProcessing || paymentSuccess}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV*</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  disabled={isProcessing || paymentSuccess}
                />
              </div>
            </div>
          </div>
        );
        
      case 'upi':
        return (
          <div className="form-section">
            <h2>UPI Payment</h2>
            <div className="form-group">
              <label htmlFor="upiId">UPI ID*</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="yourname@upi"
                disabled={isProcessing || paymentSuccess}
              />
            </div>
            <div className="upi-logos">
              <span className="upi-logo gpay"></span>
              <span className="upi-logo phonepe"></span>
              <span className="upi-logo paytm"></span>
              <span className="upi-logo bhim"></span>
            </div>
            <p className="payment-note">
              You will receive a payment request on your UPI app.
            </p>
          </div>
        );
        
      case 'cod':
        return (
          <div className="form-section">
            <h2>Cash on Delivery</h2>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number*</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                disabled={isProcessing || paymentSuccess}
              />
            </div>
            <p className="payment-note">
              Pay with cash when your laundry is delivered.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
        <p>Please select a payment method to complete your order</p>
      </div>

      <div className="payment-navigation">
        <Link to="/cart" className="back-to-cart">
          ← Back to Cart
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {paymentSuccess && (
        <div className="success-message">
          Payment successful! Redirecting to order confirmation...
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-methods">
          <div 
            className={`payment-method ${paymentMethod === 'creditCard' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('creditCard')}
          >
            <span className="payment-icon credit-card-icon"></span>
            <span>Credit Card</span>
          </div>
          <div 
            className={`payment-method ${paymentMethod === 'debitCard' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('debitCard')}
          >
            <span className="payment-icon debit-card-icon"></span>
            <span>Debit Card</span>
          </div>
          <div 
            className={`payment-method ${paymentMethod === 'upi' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('upi')}
          >
            <span className="payment-icon upi-icon"></span>
            <span>UPI</span>
          </div>
          <div 
            className={`payment-method ${paymentMethod === 'cod' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('cod')}
          >
            <span className="payment-icon cod-icon"></span>
            <span>Cash on Delivery</span>
          </div>
        </div>

        {renderPaymentForm()}

        <div className="form-section">
          <h2>Delivery Address</h2>
          <div className="form-group">
            <label htmlFor="address">Address{paymentMethod === 'cod' ? '*' : ''}</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="1234 Main St"
              disabled={isProcessing || paymentSuccess}
              required={paymentMethod === 'cod'}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City{paymentMethod === 'cod' ? '*' : ''}</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
                disabled={isProcessing || paymentSuccess}
                required={paymentMethod === 'cod'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code{paymentMethod === 'cod' ? '*' : ''}</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="400001"
                disabled={isProcessing || paymentSuccess}
                required={paymentMethod === 'cod'}
              />
            </div>
          </div>
        </div>

        <div className="payment-summary">
          <h2>Order Summary</h2>
          {cartItems.map((item) => (
            <div key={`${item.name}-${item.category}`} className="summary-row">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span>₹{DELIVERY_CHARGE}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{getTotalCost()}</span>
          </div>
        </div>

        <button
          className="pay-button"
          type="submit"
          disabled={isProcessing || paymentSuccess}
        >
          {isProcessing ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Pay ₹${getTotalCost()} ${paymentMethod === 'cod' ? 'on Delivery' : 'Now'}`
          )}
        </button>
        
        <div className="secure-payment-note">
          <span className="lock-icon">🔒</span>
          <p>Your payment information is secure and encrypted</p>
        </div>
      </form>
    </div>
  );
};

export default BasicPayment; 