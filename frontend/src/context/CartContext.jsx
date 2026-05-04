import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from local storage', error);
      return [];
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch cart data from backend
  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Clear cart if not logged in
      setCartItems([]);
      localStorage.removeItem('cart');
      setIsInitialized(true);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.items) {
        setCartItems(res.data.items);
        localStorage.setItem('cart', JSON.stringify(res.data.items));
      }
    } catch (error) {
      console.error('Failed to fetch cart from backend:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  // Sync cart data to backend
  const syncCartToBackend = async (items) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(`${API_BASE_URL}/cart/sync`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to sync cart to backend:', error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  // Save to local storage and sync to backend whenever cartItems change
  useEffect(() => {
    if (!isInitialized) return; // don't sync on initial mount before fetch
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      syncCartToBackend(cartItems);
    } catch (error) {
      console.error('Failed to save cart to local storage', error);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product, options) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    setCartItems(prev => {
      // Check if item with same product ID and options already exists
      const existingItemIndex = prev.findIndex(item => {
        const prodId = item.product?._id || item.product;
        const newProdId = product?._id || product;
        return prodId === newProdId && JSON.stringify(item.options || {}) === JSON.stringify(options || {});
      });

      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, {
          id: Date.now().toString(), // Unique ID for cart item
          product,
          options,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId && item._id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => 
      (item.id === cartItemId || item._id === cartItemId) ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCartData,
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};
