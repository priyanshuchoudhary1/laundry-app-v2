import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.name === item.name && i.category === item.category
      );

      if (existingItem) {
        return prevItems.map((i) =>
          i.name === item.name && i.category === item.category
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: item.quantity }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)  // Remove item if quantity is zero
    );
  };

  const deleteItem = (itemName, itemCategory) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.name === itemName && item.category === itemCategory)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, deleteItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
