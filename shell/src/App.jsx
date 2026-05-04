import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import ErrorBoundary from './ErrorBoundary';
import eventBus from '../../shared/eventBus';

// Composants de fallback quand un MFE ne peut pas se charger
const MFENotAvailable = ({ name }) => (
  <div style={{
    padding: '20px',
    background: '#1a0a0a',
    border: '2px solid #ff8800',
    borderRadius: '4px',
    color: '#ffaa44',
    fontFamily: 'monospace',
    textAlign: 'center',
  }}>
    <p>⚠️ {name} indisponible</p>
  </div>
);

// Import des MFEs avec React.lazy()
// Si le remote n'existe pas, on retourne un composant gracieux au lieu de crasher
const ProductList = lazy(() =>
  import('mfe_product/ProductList')
    .catch(() => ({
      default: () => <MFENotAvailable name="Catalogue" />,
    }))
);

const Cart = lazy(() =>
  import('mfe_cart/Cart')
    .catch(() => ({
      default: () => <MFENotAvailable name="Panier" />,
    }))
);

const Recommendations = lazy(() =>
  import('mfe_reco/Recommendations')
    .catch(() => ({
      default: () => <MFENotAvailable name="Recommandations" />,
    }))
);

function LoadingFallback({ name }) {
  return <div className="loading-fallback">Chargement {name}...</div>;
}

function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Écouter les mises à jour du panier pour le badge
    const unsubscribe = eventBus.on('CART_UPDATED', (cartData) => {
      setCartCount(cartData.totalItems || 0);
    });

    // Cleanup pour éviter les fuites mémoire
    return unsubscribe;
  }, []);

  return (
    <div className="shell">
      <header className="shell-header">
        <h1 className="logo">RetroShop</h1>
        <div className="cart-badge">Panier ({cartCount})</div>
      </header>
      <main className="shell-main">
        <section className="product-area">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback name="Produits" />}>
              <ProductList />
            </Suspense>
          </ErrorBoundary>
        </section>
        <aside className="cart-area">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback name="Panier" />}>
              <Cart />
            </Suspense>
          </ErrorBoundary>
        </aside>
      </main>
      <section className="reco-area">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback name="Recommandations" />}>
            <Recommendations />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}

export default App;
