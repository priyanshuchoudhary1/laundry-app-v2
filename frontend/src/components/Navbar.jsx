import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-mark">✦</span>
          <span className="logo-text">
            <span className="logo-word-1">LUXE</span>
            <span className="logo-word-2">LAUNDRY</span>
          </span>
        </Link>

        <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>Home</span>
            </Link>
            <Link to="/services" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>Services</span>
            </Link>
            <Link to="/track-order" className="nav-link" onClick={() => setIsOpen(false)}>
              <FiClock className="link-icon" />
              <span>Track Order</span>
            </Link>
            <Link to="/cart" className="nav-link cart-link" onClick={() => setIsOpen(false)}>
              <FiShoppingBag className="link-icon" />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="cart-badge">{cartItems.length}</span>
              )}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/account" className="account-link">
                  <FiUser />
                  <span>My Account</span>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Sign In
                </Link>
                <Link to="/signup" className="signup-btn">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <button 
          className="nav-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;