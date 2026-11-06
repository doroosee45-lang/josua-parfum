# JOSHUA PARFUM — Guide d'Utilisation Propriétaire (Full-Stack MERN)

**Slogan :** *Votre parfum, votre élégance.*  
**Zone de livraison :** Jendouba et communes voisines, Tunisie  
**WhatsApp officiel :** `+216 56 45 49 46`  
**Mode de règlement :** Paiement en espèces à la livraison & Commande directe par WhatsApp

---

## 1. Connexion sécurisée à l'Espace Vendeur

1. Ouvrez la boutique et cliquez sur **Atelier (👤)** en haut à droite (ou accédez à `/vendeur`).
2. Saisissez votre mot de passe propriétaire :
   - **Mot de passe initial :** `joshua2026`
3. Une session sécurisée par **jeton JWT** est ouverte avec le serveur Backend. Les clients visiteurs ne peuvent jamais accéder aux fonctions d'administration ni voir la liste globale des commandes.
4. Pour changer votre mot de passe : allez dans **Livraison Jendouba & Paramètres → Sécurité Propriétaire**.

---

## 2. Ajouter un parfum et importer des photos depuis un iPhone / Smartphone

1. Dans **Espace Vendeur**, ouvrez l'onglet **Parfums, Photos & Prix**, puis cliquez sur **« + Ajouter un parfum »**.
2. Appuyez sur **« Choisir une photo »** :
   - Sur **iPhone (Safari)** et **Android**, le sélecteur natif s'ouvre (**Photothèque**, **Prendre une photo**, **Fichiers**).
   - Vous pouvez sélectionner **une ou plusieurs photos** (JPG, PNG, WEBP, HEIC — jusqu'à 12 Mo par photo).
   - Un **aperçu immédiat** s'affiche avant l'enregistrement.
3. Saisissez exclusivement votre **Prix de vente en Dinars Tunisiens (DT)**, la catégorie (*Femme, Homme, Mixte*), la description et le stock.
4. Cliquez sur **« Enregistrer le parfum »** :
   - Les photos sont envoyées au serveur Backend (`POST /api/upload`), stockées en ligne dans `/uploads/` et visibles immédiatement par **tous les visiteurs sur tous les appareils**.

---

## 3. Suivre les commandes et contacter les clients

1. Chaque commande passée par un client génère sur le serveur une **référence unique** (`JP-YYMM-XXXX`), vérifie les tarifs officiels définis par le propriétaire et met à jour le stock disponible.
2. Le client règle **en espèces à la livraison** et peut envoyer en un clic le récapitulatif formaté sur votre WhatsApp (`+216 56 45 49 46`).
3. Dans **Espace Vendeur → Commandes**, toutes les commandes sont centralisées sur le serveur (visibles depuis votre téléphone comme depuis votre ordinateur) :
   - Filtrez par **statut** (*Nouvelle, Confirmée, En préparation, En livraison, Livrée, Annulée*) ou par **date**.
   - Changez le statut en un clic.
   - Cliquez sur **« WhatsApp Client »** pour envoyer un message de suivi pré-rédigé au client ou sur **« Appeler »**.

---

## 4. Principaux Endpoints de l'API Backend

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| `GET` | `/api/health` | Public | État du serveur et moteur de base de données actif |
| `GET` | `/api/products` | Public | Catalogue public (produits visibles uniquement) |
| `GET` | `/api/products/admin` | Admin (JWT) | Catalogue complet vendeur (incluant produits masqués) |
| `POST` | `/api/upload` | Admin (JWT) | Upload multi-photos (`multipart/form-data`) vers `/uploads/` |
| `POST` | `/api/products` | Admin (JWT) | Création d'un parfum avec prix fixé par le propriétaire |
| `PUT` | `/api/products/:id` | Admin (JWT) | Modification d'un parfum (prix, stock, photos, texte) |
| `PATCH` | `/api/products/:id/visibility` | Admin (JWT) | Masquer / Afficher un parfum dans le catalogue |
| `DELETE` | `/api/products/:id` | Admin (JWT) | Suppression d'un parfum |
| `POST` | `/api/orders` | Public | Création d'une commande + calcul serveur + référence `JP-XXXX` |
| `GET` | `/api/orders/ref/:reference` | Public | Consultation de la confirmation client par référence |
| `GET` | `/api/orders` | Admin (JWT) | Liste centralisée et filtrée de toutes les commandes |
| `PATCH` | `/api/orders/:id/status` | Admin (JWT) | Mise à jour du statut d'une commande |
| `GET` / `PUT` | `/api/settings` | Public / Admin | Zones & frais de livraison Jendouba, WhatsApp, conditions |
| `GET` | `/api/settings/backup` | Admin (JWT) | Export JSON complet des produits, commandes et paramètres |
