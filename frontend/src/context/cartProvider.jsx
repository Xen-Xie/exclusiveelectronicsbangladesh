// CartProvider.js
import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      // Use _cartKey (product + color combo) for deduplication
      // so same product in different colors are stored as separate entries
      const key = product._cartKey || product._id;
      const existing = prev.find((item) => (item._cartKey || item._id) === key);
      if (existing) {
        return prev.map((item) =>
          (item._cartKey || item._id) === key
            ? { ...item, quantity: item.quantity + product.quantity }
            : item,
        );
      } else {
        return [...prev, product];
      }
    });
  };

  const removeItem = (cartKey) => {
    setCart((prev) =>
      prev.filter((item) => (item._cartKey || item._id) !== cartKey),
    );
  };

  // Clear all items
  const clearCart = () => {
    setCart([]);
  };

  const updateQty = (cartKey, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        (item._cartKey || item._id) === cartKey
          ? { ...item, quantity: qty }
          : item,
      ),
    );
  };


  // Calculate total cart count
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, addToCart, removeItem, clearCart, updateQty }}
    >
      {children}
    </CartContext.Provider>
  );
}
