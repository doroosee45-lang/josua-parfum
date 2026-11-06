# JOSHUA PARFUM — Projet Global Full-Stack MERN (Frontend + Backend)

> **« Votre parfum, votre élégance. »**  
> Boutique en ligne de Haute Parfumerie — Livraison à Jendouba et communes voisines, Tunisie  
> Règlement en espèces à la livraison & Commande directe par WhatsApp (`+216 56 45 49 46`)

---

## Architecture du Projet Global

```text
joshua-parfum/
├── package.json                        # Scripts globaux (lance Backend + Frontend simultanément)
├── GUIDE_UTILISATION_JOSHUA_PARFUM.md  # Guide propriétaire en français
├── backend/                            # Serveur Node.js + Express + Mongoose (MongoDB) + JWT + Multer
│   ├── .env.example                    # Variables d'environnement (PORT, JWT_SECRET, MONGO_URI...)
│   ├── uploads/                        # Stockage en ligne des photos importées depuis iPhone/téléphone
│   ├── data/                           # Base persistante JSON automatique si MongoDB n'est pas actif
│   └── src/
│       ├── server.js                   # Point d'entrée Express
│       ├── config/db.js                # Connexion Mongoose / MongoDB + bascule automatique
│       ├── models/                     # Schémas Mongoose (Product, Order, Setting, Admin)
│       ├── repositories/               # Couche d'accès données unifiée (MongoDB + JSON persistant)
│       ├── middleware/                 # Sécurité JWT (authMiddleware) & Upload Multer (uploadMiddleware)
│       ├── controllers/                # Logique métier (produits, commandes, tarifs exclusifs, photos)
│       └── routes/                     # Routes REST (/api/auth, /api/products, /api/orders, /api/settings, /api/upload)
└── frontend/                           # Application Web React 19 + Vite + React Router + Tailwind CSS
    ├── vite.config.js                  # Proxy automatique de /api et /uploads vers le Backend (:5000)
    ├── public/images/                  # Photographies haute parfumerie harmonisées
    └── src/
        ├── services/api.js             # Client HTTP connecté à l'API REST Backend
        ├── context/BoutiqueContext.jsx # Synchronisation temps réel avec le Backend & session JWT
        ├── components/                 # Interface harmonisée style La Roselle Atelier
        └── pages/                      # Accueil, Collection, Fiche Produit, Commande, Confirmation, Contact, Espace Vendeur
```

---

## Démarrage Rapide (Frontend + Backend reliés)

Prérequis : **Node.js v18+ ou v20+**.

### 1. Installer toutes les dépendances (Racine + Backend + Frontend)
```bash
npm run install:all
```

### 2. Lancer le projet complet en mode développement
```bash
npm run dev
```
- **Backend API REST :** `http://localhost:5000` (`/api/health`, `/api/products`, `/api/orders`, `/uploads/...`)
- **Frontend Boutique & Espace Vendeur :** `http://localhost:5173` (relié automatiquement au Backend via le proxy Vite)

---

## Base de données MongoDB (Locale ou MongoDB Atlas)

Dans `backend/.env` (copiez `backend/.env.example` vers `backend/.env` si besoin) :
- **Avec MongoDB (Recommandé en production) :** renseignez `MONGO_URI=mongodb://127.0.0.1:27017/joshua_parfum` ou votre lien **MongoDB Atlas** (`mongodb+srv://...`). Au premier lancement, le serveur crée et peuple automatiquement les collections (`products`, `orders`, `settings`, `admins`).
- **Sans installation préalable de MongoDB :** laissez `MONGO_URI=` vide ; le backend fonctionne immédiatement grâce à son moteur persistant serveur (`backend/data/database.json`) tout en conservant exactement les mêmes routes API, le même chiffrement `bcrypt`, l'authentification `JWT` et le stockage des photos dans `backend/uploads/`.

---

## Accès Propriétaire (Espace Vendeur)

- **URL :** `/vendeur` (ou icône **Atelier** en haut à droite)
- **Mot de passe initial :** `joshua2026` *(chiffré avec `bcryptjs`, modifiable depuis l'Espace Vendeur)*

---

## Mise en Production Unifiée

```bash
# Compiler le frontend React dans frontend/dist
npm run build

# Démarrer le serveur Express en production (sert l'API + /uploads + le site React sur un seul port)
npm start
```
