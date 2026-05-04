import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import ErrorBoundary from './ErrorBoundary';
import eventBus from '../../shared/eventBus';

// Import des MFEs avec React.lazy()
// Chaque lazy() inclut un .catch() pour la résilience en cas d'erreur réseau
const ProductList = lazy(() =>
  import('mfe_product/ProductList').catch(() => {
    throw new Error('Impossible de charger le catalogue');
  })
);

const Cart = lazy(() =>
  import('mfe_cart/Cart').catch(() => {
    throw new Error('Impossible de charger le panier');
  })
);

const Recommendations = lazy(() =>
  import('mfe_reco/Recommendations').catch(() => {
    throw new Error('Impossible de charger les recommandations');
  })
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
