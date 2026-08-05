import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Initialize State from LOCAL STORAGE
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('userCart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart data:", error);
      return [];
    }
  });

  // 2. Add to Cart (SYNCHRONOUS SAVE TO LOCAL STORAGE)
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      // Prevent duplicates
      const exists = prevItems.find((i) => i.id === item.id);
      if (exists) return prevItems; 
      
      const newCart = [...prevItems, item];
      
      // 🔥 FORCE SAVE INSTANTLY: This guarantees the item is in memory
      // BEFORE React Router has a chance to change the page.
      localStorage.setItem('userCart', JSON.stringify(newCart)); 
      
      return newCart;
    });
  };

  // 3. Remove Item
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const newCart = prevItems.filter((item) => item.id !== itemId);
      
      // 🔥 FORCE SAVE INSTANTLY
      localStorage.setItem('userCart', JSON.stringify(newCart)); 
      
      return newCart;
    });
  };

  // 4. Clear Cart (After successful payment)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('userCart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);