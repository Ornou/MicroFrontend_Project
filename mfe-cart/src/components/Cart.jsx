import React, { useState, useEffect } from 'react';
import eventBus from 'shared/eventBus';
import './Cart.css';

function Cart() {
  const [items, setItems] = useState([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const addToCart = (product) => {
      setItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    };

    eventBus.on('ADD_TO_CART', addToCart, 'mfe-cart');

    return () => {
      eventBus.off('ADD_TO_CART', addToCart);
    };
  }, []);

  useEffect(() => {
    const payload = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      totalItems,
      totalPrice
    };
    eventBus.emit('CART_UPDATED', payload);
  }, [items, totalItems, totalPrice]);

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClear = () => {
    setItems([]);
    eventBus.emit('cart:clear', { timestamp: Date.now() });
  };

  return (
    <div className="cart">
      <h2>Panier ({totalItems})</h2>
      {items.length === 0 ? (
        <p className="empty">Panier vide</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(item => (
              <li key={item.id} className="cart-item">
                <span className="item-name">{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                <span className="item-price">{(item.price * item.quantity).toFixed(2)} EUR</span>
                <button className="remove-btn" onClick={() => handleRemove(item.id)}>x</button>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <div className="cart-total">Total : {totalPrice.toFixed(2)} EUR</div>
            <button className="clear-btn" onClick={handleClear}>Vider le panier</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
