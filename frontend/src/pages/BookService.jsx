import React, { useState } from "react";
import "./BookService.css";
import { useCart } from "../context/CartContext";  // ✅ Required for syncing with cart
import { Link } from "react-router-dom";           // ✅ Required for "Go to Cart" button


const serviceData = {
  washing: [
    { name: "Shirt", price: 10 },
    { name: "T-Shirt", price: 7 },
    { name: "Jeans", price: 15 },
    { name: "Pant", price: 12 },
  ],
  washingIroning: [
    { name: "Shirt", price: 15 },
    { name: "T-Shirt", price: 12 },
    { name: "Jeans", price: 20 },
    { name: "Pant", price: 17 },
  ],
  dryCleaning: [
    { name: "Saree", price: 50 },
    { name: "Coat", price: 55 },
    { name: "Suit", price: 50 },
    { name: "Blanket", price: 60 },
    { name: "Curtain", price: 65 },
  ],
};

const BookService = () => {
  const [selectedTab, setSelectedTab] = useState("washing");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const { addToCart, removeFromCart } = useCart();

  const handleItemChange = (itemName, change, price) => {
    setSelectedItems((prev) => {
      const quantity = (prev[itemName]?.quantity || 0) + change;
      const newItems = { ...prev };

      if (quantity > 0) {
        newItems[itemName] = { quantity, price };
      } else {
        delete newItems[itemName];
      }

      return newItems;
    });

    const item = {
      id: `${itemName}-${selectedTab}`,
      name: itemName,
      category: selectedTab,
      price,
    };

    if (change === 1) addToCart(item);
    if (change === -1) removeFromCart(itemName, selectedTab);
  };

  const openModal = (tab) => {
    setSelectedTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItems({});
  };

  const calculateTotal = () => {
    return Object.values(selectedItems).reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const renderItems = (type) => {
    return serviceData[type].map((item) => {
      const count = selectedItems[item.name]?.quantity || 0;

      return (
        <div className="item" key={item.name}>
          <span>{item.name} — ₹{item.price}</span>
          <div className="quantity-buttons">
            <button onClick={() => handleItemChange(item.name, -1, item.price)}>-</button>
            <span>{count}</span>
            <button onClick={() => handleItemChange(item.name, 1, item.price)}>+</button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="book-service">
      <h1>Book Your Laundry Service</h1>
      <div className="tabs">
        <button onClick={() => openModal("washing")}>Washing</button>
        <button onClick={() => openModal("washingIroning")}>Washing & Ironing</button>
        <button onClick={() => openModal("dryCleaning")}>Dry Cleaning</button>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              {selectedTab === "washing"
                ? "Washing"
                : selectedTab === "washingIroning"
                ? "Washing & Ironing"
                : "Dry Cleaning"}
            </h2>

            {renderItems(selectedTab)}

            <div className="modal-summary">
              <h3>Total: ₹{calculateTotal()}</h3>
              <button className="done-btn" onClick={closeModal}>Done</button>
            </div>
          </div>
        </div>
      )}

      <div className="summary-footer">
        <Link to="/cart" className="cart-link">
          Go to Cart
        </Link>
      </div>
    </div>
  );
};

export default BookService;
