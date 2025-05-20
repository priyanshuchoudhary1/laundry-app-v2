import React, { useState } from "react";
import { FaTrashAlt, FaShoppingBag, FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaPaypal } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cartItems, deleteItem } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const DELIVERY_CHARGE = 50;

  console.log('User object in Cart:', user);

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
      // Directly navigate to payment page with the selected payment method
      navigate('/basic-payment', { state: { paymentMethod: selectedPayment } });
    } else {
      // Show payment method selection notification
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
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span>{getFormattedPrice(DELIVERY_CHARGE)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>{getFormattedPrice(getTotalCost() + DELIVERY_CHARGE)}</span>
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
                  {selectedPayment === 'creditCard' && "Pay securely using your credit card. We accept Visa, Mastercard, and American Express."}
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
