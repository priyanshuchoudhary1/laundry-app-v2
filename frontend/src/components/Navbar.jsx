import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaTimes, FaBars, FaHistory } from 'react-icons/fa';
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAccountClick = () => {
    if (!user) {
      navigate('/login');
    }
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          LaundryPro
        </Link>

        <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/services" onClick={() => setIsOpen(false)}>Services</Link></li>
          
          <li>
            <Link to="/cart" className="nav-icon" onClick={() => setIsOpen(false)}>
              <FaShoppingCart />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="cart-count">{cartItems.length}</span>
              )}
            </Link>
          </li>

          <li>
            <Link to="/track-orders" className="nav-icon" onClick={() => setIsOpen(false)}>
              <FaHistory />
              <span>Track Orders</span>
            </Link>
          </li>

          <li>
            <Link 
              to={user ? "/account" : "/login"} 
              className="nav-icon" 
              onClick={handleAccountClick}
            >
              <FaUser />
              <span>Account</span>
            </Link>
          </li>

          {user ? (
            <li>
              <button onClick={handleLogout} className="nav-icon">
                <FaTimes />
                <span>Logout</span>
              </button>
            </li>
          ) : (
            <li>
              <Link to="/signup" className="nav-icon" onClick={() => setIsOpen(false)}>
                <FaUser />
                <span>Sign Up</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;