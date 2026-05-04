# 📋 Contrat des Événements EventBus

## Événement 1: `ADD_TO_CART` (cart:add)

### Contrat
```
Event Name: ADD_TO_CART (ou cart:add)
Payload: {
  id: number,
  name: string,
  price: number,
  image: string
}

Emitterreurs:
  - mfe-product (ProductGrid.jsx)

Listeners:
  - mfe-cart (Cart.jsx)
```

### Validation
- **id**: number (requis) - Identifiant unique du produit
- **name**: string (requis) - Nom du produit
- **price**: number (requis) - Prix du produit en EUR
- **image**: string (requis) - URL ou référence de l'image

### Exemple valide
```javascript
{
  id: 1,
  name: 'Manette SNES',
  price: 29,
  image: 'snes'
}
```

---

## Événement 2: `cart:clear`

### Contrat
```
Event Name: cart:clear
Payload: {
  timestamp: number
}

Émetteurs:
  - mfe-cart (Cart.jsx - bouton "Vider le panier")

Listeners:
  - shell (App.jsx - réinitialise le badge)
  - mfe-reco (Recommendations.jsx - revient aux recos par défaut)
```

### Validation
- **timestamp**: number (requis) - Date/heure du clear en millisecondes (Date.now())

### Exemple valide
```javascript
{
  timestamp: 1714812185123
}
```

### Utilisation dans le code
```javascript
// Émission
eventBus.emit('cart:clear', { timestamp: Date.now() });

// Écoute
eventBus.on('cart:clear', (data) => {
  console.log('Panier vidé à', new Date(data.timestamp));
}, 'mon-mfe');
```

---

## Événement 3: `CART_UPDATED`

### Contrat
```
Event Name: CART_UPDATED
Payload: {
  items: Array<{
    id: number,
    name: string,
    price: number,
    image: string,
    quantity: number
  }>,
  totalItems: number,
  totalPrice: number
}

Émetteurs:
  - mfe-cart (Cart.jsx)

Listeners:
  - shell (App.jsx)
  - mfe-reco (Recommendations.jsx)
```

---

## ⚠️ Cleanup obligatoire dans useEffect

**Pourquoi le cleanup est obligatoire pour `cart:clear`:**

1. **Éviter les fuites mémoire**: Les callbacks non nettoyés restent en mémoire et s'accumulent à chaque re-rendu du composant
2. **Éviter les callbacks dupliqués**: Sans cleanup, un événement `cart:clear` pourrait déclencher 2, 3, ou N fois la même action au lieu de 1 fois, car les anciens callbacks ne sont jamais supprimés

### ❌ MAUVAIS (sans cleanup)
```javascript
useEffect(() => {
  eventBus.on('cart:clear', () => setRecos(PRODUCTS.slice(0, 3)));
  // Pas de return => pas de cleanup!
}, []);
// À chaque re-rendu: 1 listener de plus!
```

### ✅ BON (avec cleanup)
```javascript
useEffect(() => {
  const unsubscribe = eventBus.on('cart:clear', () => {
    setRecos(PRODUCTS.slice(0, 3));
  }, 'mfe-reco');
  
  return unsubscribe; // Cleanup au démontage/re-rendu
}, []);
// Jamais plus d'1 listener actif
```
