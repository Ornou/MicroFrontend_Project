import React, { useState, useEffect } from 'react';
import eventBus from 'shared/eventBus';
import PRODUCTS from 'shared/products';
import './Recommendations.css';

function Recommendations() {
  const [recos, setRecos] = useState(PRODUCTS.slice(0, 3));

  useEffect(() => {
    const buildRecommendations = (cartPayload) => {
      const cartItems = cartPayload?.items || [];

      if (cartItems.length === 0) {
        setRecos(PRODUCTS.slice(0, 3));
        return;
      }

      const cartIds = new Set(cartItems.map((item) => item.id));
      const selectedCategories = new Set();

      cartItems.forEach((item) => {
        const match = PRODUCTS.find((product) => product.id === item.id);
        if (match?.category) {
          selectedCategories.add(match.category);
        }
      });

      const inCategory = PRODUCTS.filter(
        (product) =>
          selectedCategories.has(product.category) && !cartIds.has(product.id)
      );

      const fallback = PRODUCTS.filter(
        (product) =>
          !selectedCategories.has(product.category) && !cartIds.has(product.id)
      );

      setRecos([...inCategory, ...fallback].slice(0, 3));
    };

    const handleClearCart = () => {
      setRecos(PRODUCTS.slice(0, 3));
    };

    eventBus.on('CART_UPDATED', buildRecommendations, 'mfe-reco');
    eventBus.on('cart:clear', handleClearCart, 'mfe-reco');

    return () => {
      eventBus.off('CART_UPDATED', buildRecommendations);
      eventBus.off('cart:clear', handleClearCart);
    };
  }, []);

  const handleAddReco = (product) => {
    eventBus.emit('ADD_TO_CART', {
      id: product.id,
      name: product.name,
      price: product.price,
      image: `${product.image}.png`,
    });
  };

  return (
    <div className="recommendations">
      <h2>Les joueurs achetent aussi</h2>
      <div className="reco-list">
        {recos.map(p => (
          <div key={p.id} className="reco-card" onClick={() => handleAddReco(p)}>
            <div className="reco-image" data-category={p.category}>{p.category}</div>
            <span className="reco-name">{p.name}</span>
            <span className="reco-price">{p.price} EUR</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
