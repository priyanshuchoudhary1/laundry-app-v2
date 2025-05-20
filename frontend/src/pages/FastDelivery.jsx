import React from "react";
import { FaShippingFast, FaClock, FaMapMarkerAlt, FaBell, FaMobileAlt } from "react-icons/fa";
import deliveryImage from "../assets/delivery-service.jpg"; // Add your image path
import "./FastDelivery.css";

const FastDelivery = () => {
  const features = [
    {
      icon: <FaShippingFast className="feature-icon" />,
      title: "Express Delivery",
      description: "Get your laundry back within 24 hours with our express service"
    },
    {
      icon: <FaClock className="feature-icon" />,
      title: "On-Time Guarantee",
      description: "We promise on-time delivery or your next service is free"
    },
    {
      icon: <FaMapMarkerAlt className="feature-icon" />,
      title: "Live Tracking",
      description: "Track your order in real-time through our app"
    },
    {
      icon: <FaBell className="feature-icon" />,
      title: "Smart Notifications",
      description: "Get instant updates about your order status"
    },
    {
      icon: <FaMobileAlt className="feature-icon" />,
      title: "Easy Scheduling",
      description: "Book pickup and delivery with just a few taps"
    }
  ];

  return (
    <section className="fast-delivery-section">
      <div className="delivery-hero">
        <div className="hero-content">
          <h1 className="hero-title">Lightning Fast Laundry Delivery</h1>
          <p className="hero-subtitle">
            Get your clothes cleaned and delivered faster than ever with our premium service
          </p>
          <button className="cta-button">Schedule Pickup Now</button>
        </div>
        <div className="hero-image">
          <img src={deliveryImage} alt="Fast delivery service" />
        </div>
      </div>

      <div className="delivery-features">
        <h2 className="section-title">Why Choose Our Delivery Service?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="delivery-process">
        <h2 className="section-title">How It Works</h2>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Schedule Pickup</h3>
            <p>Book through our app or website in under 2 minutes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>We Collect</h3>
            <p>Our professional team picks up at your chosen time</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Expert Cleaning</h3>
            <p>Your clothes receive premium care at our facility</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Fast Delivery</h3>
            <p>Fresh clothes returned to you within 24 hours</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FastDelivery;