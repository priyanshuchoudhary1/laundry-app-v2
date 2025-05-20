import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './Payment.css';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('your_publishable_key');

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');

  const DELIVERY_CHARGE = 50;

  const getTotalCost = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) + DELIVERY_CHARGE;
  };

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: getTotalCost() }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      try {
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirmError) {
          setError(confirmError.message);
        } else {
          setError(null);
          setSucceeded(true);
          clearCart();
          setTimeout(() => {
            navigate('/order-confirmation');
          }, 2000);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      }
    }
    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
        <p>Please enter your payment details to proceed with the order.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {succeeded && (
        <div className="success-message">
          Payment successful! Redirecting to order confirmation...
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-section">
          <h2>Payment Details</h2>
          <div className="form-group">
            <label>Card Information</label>
            <CardElement
              options={cardElementOptions}
              onChange={handleChange}
            />
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
          disabled={processing || disabled || succeeded}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

const Payment = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default Payment;