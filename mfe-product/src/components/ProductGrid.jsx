import React from 'react';
import eventBus from '../../../shared/eventBus';
import PRODUCTS from '../../../shared/products';
import './ProductGrid.css';

const ProductGrid = () => {
  const handleAddToCart = (product) => {
    eventBus.emit('ADD_TO_CART', product);
  };

  return (
    <div className="product-grid">
      {PRODUCTS.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} className="product-image" />
          <h3>{product.name}</h3>
          <p>${product.price.toFixed(2)}</p>
          <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
