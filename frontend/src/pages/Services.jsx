import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import '../styles/pages/Services.css';

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});

  const categories = {
    daily: {
      name: 'Daily Wear',
      icon: '👕',
      items: [
        { name: 'T-Shirt', price: 20 },
        { name: 'Shirt', price: 25 },
        { name: 'Jeans', price: 30 },
        { name: 'Trousers', price: 30 },
        { name: 'Shorts', price: 20 },
        { name: 'Socks', price: 10 }
      ]
    },
    woolen: {
      name: 'Woolen Wear',
      icon: '🧥',
      items: [
        { name: 'Sweater', price: 50 },
        { name: 'Jacket', price: 60 },
        { name: 'Winter Coat', price: 70 },
        { name: 'Thermal Wear', price: 40 },
        { name: 'Woolen Scarf', price: 30 },
        { name: 'Gloves', price: 25 }
      ]
    },
    ethnic: {
      name: 'Ethnic Wear',
      icon: '👘',
      items: [
        { name: 'Kurta', price: 40 },
        { name: 'Saree', price: 80 },
        { name: 'Lehenga', price: 100 },
        { name: 'Sherwani', price: 120 },
        { name: 'Dhoti', price: 35 },
        { name: 'Dupatta', price: 30 }
      ]
    },
    household: {
      name: 'Household Items',
      icon: '🏠',
      items: [
        { name: 'Bedsheet', price: 50 },
        { name: 'Pillow Cover', price: 20 },
        { name: 'Curtains', price: 60 },
        { name: 'Table Cloth', price: 30 },
        { name: 'Carpet', price: 100 },
        { name: 'Blanket', price: 70 }
      ]
    },
    delicate: {
      name: 'Delicate Items',
      icon: '👗',
      items: [
        { name: 'Silk Dress', price: 90 },
        { name: 'Lace Items', price: 70 },
        { name: 'Embroidery Work', price: 80 },
        { name: 'Designer Wear', price: 120 },
        { name: 'Party Wear', price: 100 },
        { name: 'Bridal Wear', price: 150 }
      ]
    }
  };

  const handleQuantityChange = (itemName, change) => {
    const key = itemName.toLowerCase().replace(/\s+/g, '');
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + change)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total, [key, qty]) => {
      const item = Object.values(categories)
        .flatMap(cat => cat.items)
        .find(item => item.name.toLowerCase().replace(/\s+/g, '') === key);
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    const itemsToAdd = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([key, qty]) => {
        const item = Object.values(categories)
          .flatMap(cat => cat.items)
          .find(item => item.name.toLowerCase().replace(/\s+/g, '') === key);
        return {
          name: item.name,
          price: item.price,
          quantity: qty,
          category: Object.entries(categories).find(([_, cat]) => 
            cat.items.some(i => i.name === item.name)
          )[1].name
        };
      });

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      setSelectedService(null);
      setQuantities({});
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  const renderCategoryItems = (category) => {
    return (
      <div className="category-section">
        <div className="category-header">
          <span className="category-icon">{category.icon}</span>
          <h2>{category.name}</h2>
        </div>
        <div className="items-grid">
          {category.items.map((item) => (
            <div key={item.name} className="item-card">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">₹{item.price}</p>
              </div>
              <div className="quantity-control">
                <button onClick={() => handleQuantityChange(item.name, -1)}>-</button>
                <span>{quantities[item.name.toLowerCase().replace(/\s+/g, '')] || 0}</span>
                <button onClick={() => handleQuantityChange(item.name, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="services-container">
      <div className="services-hero">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Choose from our range of professional laundry services</p>
        </div>
      </div>

      <div className="services-content">
        <div className="category-tabs">
          <button 
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </button>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(key)}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        <div className="categories-container">
          {selectedCategory === 'all' 
            ? Object.values(categories).map((category, index) => (
                <React.Fragment key={index}>
                  {renderCategoryItems(category)}
                </React.Fragment>
              ))
            : renderCategoryItems(categories[selectedCategory])
          }
        </div>

        {Object.values(quantities).some(qty => qty > 0) && (
          <div className="cart-summary">
            <div className="cart-total">
              Total: ₹{calculateTotal()}
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        )}
      </div>

      {showLoginPopup && (
        <div className="modal-overlay">
          <div className="modal-content login-popup">
            <h2>Login Required</h2>
            <p>To order your service, please login first</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowLoginPopup(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleLoginRedirect}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
  