# RetroShop — Contrat d'équipe

## Micro-Frontends · Phase 1 · Négociation

> **Ce document est le contrat partagé entre tous les membres de l'équipe.**
> Chaque développeur doit le lire, le comprendre et le respecter à la lettre.
> Une seule faute de frappe dans un nom d'événement = silence total à l'assemblage.

---

## 1. Architecture générale

| Service | Port | Responsable | Rôle |
|---------|------|-------------|------|
| **shell** | 3000 | Étudiant A | Orchestrateur, charge les MFEs, affiche le badge panier |
| **mfe-product** | 3001 | Étudiant B | Grille de produits, bouton "Ajouter" |
| **mfe-cart** | 3002 | Étudiant C | Panier latéral : liste, total, bouton "Vider" |
| **mfe-reco** | 3003 | Étudiant D | Recommandations "Les joueurs achètent aussi" |

> Équipe de 3 : ignorer mfe-reco (port 3003) et l'Étudiant D.

---

## 2. Bus d'événements — Référence

Le fichier `shared/eventBus.js` est le seul moyen de communication entre les MFEs. Il expose trois méthodes :

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `on` | `on(event, callback)` | S'abonner à un événement |
| `off` | `off(event, callback)` | Se désabonner (cleanup) |
| `emit` | `emit(event, payload)` | Émettre un événement |

**Règle absolue** : toujours appeler `off()` dans le `return` du `useEffect` pour éviter les fuites mémoire.

---

## 3. Contrat des événements

### Événement 1 — `ADD_TO_CART`

**Déclencheur** : clic sur le bouton "Ajouter" d'un produit.

| Champ | Valeur |
|-------|--------|
| **Nom exact** | `ADD_TO_CART` |
| **Émetteur** | mfe-product (Étudiant B) |
| **Écouteurs** | mfe-cart (Étudiant C) |

**Payload** :

```json
{
  "id": 1,
  "name": "Super Mario Bros.",
  "price": 29.99,
  "image": "mario.png"
}
```

| Propriété | Type | Obligatoire | Exemple |
|-----------|------|-------------|---------|
| `id` | `number` | oui | `1` |
| `name` | `string` | oui | `"Super Mario Bros."` |
| `price` | `number` | oui | `29.99` |
| `image` | `string` | oui | `"mario.png"` |

---

### Événement 2 — `CART_UPDATED`

**Déclencheur** : à chaque modification du panier (ajout d'un article, vidage).

| Champ | Valeur |
|-------|--------|
| **Nom exact** | `CART_UPDATED` |
| **Émetteur** | mfe-cart (Étudiant C) |
| **Écouteurs** | shell (Étudiant A), mfe-reco (Étudiant D) |

**Payload** :

```json
{
  "items": [
    {
      "id": 1,
      "name": "Super Mario Bros.",
      "price": 29.99,
      "image": "mario.png",
      "quantity": 2
    }
  ],
  "totalItems": 3,
  "totalPrice": 89.97
}
```

| Propriété | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `items` | `array` | oui | Tableau d'objets produit avec `quantity` |
| `items[].id` | `number` | oui | ID du produit |
| `items[].name` | `string` | oui | Nom du produit |
| `items[].price` | `number` | oui | Prix unitaire |
| `items[].image` | `string` | oui | Nom du fichier image |
| `items[].quantity` | `number` | oui | Quantité dans le panier |
| `totalItems` | `number` | oui | Nombre total d'articles (somme des quantity) |
| `totalPrice` | `number` | oui | Prix total (somme de price × quantity) |

---

### Événement 3 — `CLEAR_CART`

**Déclencheur** : clic sur le bouton "Vider le panier".

| Champ | Valeur |
|-------|--------|
| **Nom exact** | `CLEAR_CART` |
| **Émetteur** | mfe-cart (Étudiant C) |
| **Écouteurs** | mfe-reco (Étudiant D) |

**Payload** : aucun (`null`)

---

## 4. Matrice Émetteur / Écouteur

| Événement | shell (A) | mfe-product (B) | mfe-cart (C) | mfe-reco (D) |
|-----------|-----------|-----------------|--------------|--------------|
| `ADD_TO_CART` | — | **ÉMET** | écoute | — |
| `CART_UPDATED` | écoute | — | **ÉMET** | écoute |
| `CLEAR_CART` | — | — | **ÉMET** | écoute |

---

## 5. Webpack Module Federation — Conventions

### Noms des remotes et modules exposés

| MFE | `name` dans webpack | `exposes` | URL du remote |
|-----|---------------------|-----------|---------------|
| mfe-product | `mfe_product` | `./ProductList` | `mfe_product@http://localhost:3001/remoteEntry.js` |
| mfe-cart | `mfe_cart` | `./Cart` | `mfe_cart@http://localhost:3002/remoteEntry.js` |
| mfe-reco | `mfe_reco` | `./Recommendations` | `mfe_reco@http://localhost:3003/remoteEntry.js` |

### Dépendances partagées (shared)

Chaque MFE et le shell doivent déclarer dans `shared` :

```javascript
shared: {
  react: { singleton: true, requiredVersion: "^18.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^18.0.0" }
}
```

**`singleton: true` est obligatoire.** Sans ça → erreur "Invalid hook call".

---

## 6. Imports dans le Shell (Étudiant A)

```javascript
const ProductList = React.lazy(() => import("mfe_product/ProductList"));
const Cart = React.lazy(() => import("mfe_cart/Cart"));
const Recommendations = React.lazy(() => import("mfe_reco/Recommendations"));
```

Chaque import doit être enveloppé dans un `<Suspense fallback={<div>Chargement...</div>}>` et un `<ErrorBoundary>`.

Si un MFE tombe (ex: Ctrl+C sur mfe-reco), l'ErrorBoundary affiche un fallback au lieu de crasher toute la page.

---

## 7. Règles de développement

1. **Nommer exactement** : `ADD_TO_CART`, `CART_UPDATED`, `CLEAR_CART` — tout en majuscules, underscores, pas de variation.
2. **Respecter les types** : `id` et `price` sont des `number`, jamais des `string`.
3. **Cleanup systématique** : chaque `useEffect` qui appelle `eventBus.on()` doit retourner une fonction qui appelle `eventBus.off()`.
4. **Ne jamais importer un MFE depuis un autre MFE** : la communication passe uniquement par l'eventBus.
5. **Tester en isolation** : chaque MFE doit démarrer seul sans erreur sur son port.

---

## 8. Checklist de validation

- [ ] Les 4 services démarrent sans erreur
- [ ] Cliquer "Ajouter" dans le catalogue ajoute l'article au panier
- [ ] Le badge du header affiche le bon nombre
- [ ] Les recommandations changent selon le contenu du panier
- [ ] Vider le panier remet tout à zéro
- [ ] Tuer mfe-reco (Ctrl+C) ne casse pas le reste de la page