import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import './Services.css';

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [quantities, setQuantities] = useState({
    tshirt: 0,
    shirt: 0,
    jeans: 0,
    sweater: 0,
    jacket: 0,
    bedsheet: 0,
    pillow: 0,
    towel: 0,
  });

  const services = [
    {
      id: 1,
      name: 'Dry Cleaning',
      description: 'Professional dry cleaning for your delicate garments',
      price: 20,
      icon: '🧼',
      features: ['Gentle cleaning', 'Stain removal', 'Professional pressing'],
      items: [
        "T-Shirt",
        "Shirt",
        "Jeans",
        "Sweater",
        "Jacket",
        "Bedsheet",
        "Pillow Cover",
        "Towel",
      ],
    },
    {
      id: 2,
      name: 'Laundry',
      description: 'Regular laundry service with premium detergents',
      price: 50,
      icon: '🧺',
      features: ['Machine wash', 'Premium detergents', 'Gentle drying'],
      items: [
        "T-Shirt",
        "Shirt",
        "Jeans",
        "Sweater",
        "Jacket",
        "Bedsheet",
        "Pillow Cover",
        "Towel",
      ],
    },
    {
      id: 3,
      name: 'Ironing',
      description: 'Professional ironing service for crisp, wrinkle-free clothes',
      price: 99,
      icon: '🔥',
      features: ['Professional pressing', 'Steam ironing', 'Wrinkle-free finish'],
      items: [
        "T-Shirt",
        "Shirt",
        "Jeans",
        "Sweater",
        "Jacket",
        "Bedsheet",
        "Pillow Cover",
        "Towel",
      ],
    }
  ];

  const handleQuantityChange = (itemName, change) => {
    const key = itemName.toLowerCase().replace(/\s+/g, '');
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + change)
    }));
  };

  const calculateTotal = (service) => {
    return service.price * Object.values(quantities).reduce((total, qty) => total + qty, 0);
  };

  const handleAddToCart = (service) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    const itemsToAdd = service.items
      .filter(item => {
        const key = item.toLowerCase().replace(/\s+/g, '');
        return quantities[key] > 0;
      })
      .map(item => ({
        name: item,
        price: service.price,
        quantity: quantities[item.toLowerCase().replace(/\s+/g, '')] || 0,
        category: service.name
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      setSelectedService(null);
      setQuantities({
        tshirt: 0,
        shirt: 0,
        jeans: 0,
        sweater: 0,
        jacket: 0,
        bedsheet: 0,
        pillow: 0,
        towel: 0,
      });
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  const handleRemoveFromCart = (serviceId) => {
    // Implementation for removing from cart
  };

  return (
    <div className="services-container">
      <div className="services-hero" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1604176424472-1a1d1a1c4c8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)`
      }}>
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Choose from our range of professional laundry services</p>
        </div>
      </div>

      <div className="services-content">
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h2>{service.name}</h2>
              <p className="service-description">{service.description}</p>
              <div className="service-features">
                {service.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={() => setSelectedService(service)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedService && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Items for {selectedService.name}</h2>
            <div className="items-list">
              {selectedService.items.map((item) => (
                <div key={item} className="item-control">
                  <div className="item-info">
                    <span className="item-name">{item}</span>
                  </div>
                  <div className="quantity-control">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      -
                    </button>
                    <span>{quantities[item.toLowerCase().replace(/\s+/g, '')] || 0}</span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-total">
              Total: ₹{calculateTotal(selectedService)}
            </div>
            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedService(null);
                  setQuantities({
                    tshirt: 0,
                    shirt: 0,
                    jeans: 0,
                    sweater: 0,
                    jacket: 0,
                    bedsheet: 0,
                    pillow: 0,
                    towel: 0,
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => handleAddToCart(selectedService)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Popup */}
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
  