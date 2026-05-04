import React from 'react';
import eventBus from '../../../shared/eventBus';
import './ProductGrid.css';

const products = [
  { id: 1, name: 'Super Mario Bros.', price: 29.99, image: 'mario.png' },
  { id: 2, name: 'The Legend of Zelda', price: 49.99, image: 'zelda.png' },
  { id: 3, name: 'Donkey Kong', price: 39.99, image: 'donkey.png' },
];

const ProductGrid = () => {
  const handleAddToCart = (product) => {
    eventBus.emit('ADD_TO_CART', product);
  };

  return (
    <div className="product-grid">
      {products.map((product) => (
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
