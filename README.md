# Blog IEG - MEAN Stack Platform

Plateforme de blog collaborative multi-auteurs avec gestion avancée des permissions, commentaires en temps réel, et tableau de bord analytique.

## 🚀 Stack Technologique

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Socket.io** - Communication temps réel
- **JWT** - Authentification sécurisée
- **Swagger** - Documentation API

### Frontend
- **Angular 20** - Framework frontend moderne
- **TypeScript** - Langage typé
- **Socket.io Client** - WebSocket client
- **Chart.js** - Visualisation de données
- **RxJS** - Programmation réactive
- **Angular Material** - Composants UI

### Testing
- **Jest** - Tests unitaires (Backend + Frontend)
- **Playwright** - Tests e2e (Frontend)
- **Supertest** - Tests API (Backend)
- **MongoDB Memory Server** - Tests de base de données

## ✨ Fonctionnalités Principales

### 1. Authentification & Autorisation
- ✅ Inscription et connexion sécurisées
- ✅ JWT avec refresh token (Access: 15min, Refresh: 7 jours)
- ✅ Système de rôles (RBAC):
  - **Admin**: Accès complet (gestion utilisateurs, tous les articles, dashboard)
  - **Éditeur**: Modification de tous les articles
  - **Rédacteur**: Modification de ses propres articles uniquement
  - **Lecteur**: Lecture et commentaires
- ✅ Guards de route côté frontend
- ✅ Middleware d'autorisation côté backend

### 2. Gestion des Articles (CRUD)
- ✅ Création d'articles avec titre, contenu, image, tags, catégorie
- ✅ Modification avec permissions basées sur le rôle
- ✅ Suppression (Admin uniquement)
- ✅ Liste paginée avec recherche et filtrage
- ✅ Système de likes
- ✅ Compteur de vues
- ✅ Statuts: DRAFT, PUBLISHED, ARCHIVED
- ✅ Génération automatique de slug

### 3. Commentaires en Temps Réel
- ✅ WebSocket (Socket.io) pour mises à jour instantanées
- ✅ Commentaires imbriqués (réponses aux commentaires)
- ✅ Système de likes sur les commentaires
- ✅ Notifications en temps réel pour les auteurs
- ✅ Suppression par l'auteur ou admin
- ✅ Soft delete pour préserver l'historique

### 4. Notifications
- ✅ Notifications en temps réel via WebSocket
- ✅ Types: nouveaux commentaires, réponses, likes
- ✅ Badge de compteur non lu
- ✅ Marquer comme lu / tout marquer comme lu
- ✅ Suppression de notifications

### 5. Dashboard Analytics (Admin)
- ✅ Statistiques générales (articles, commentaires, utilisateurs)
- ✅ Graphiques interactifs:
  - Articles publiés par mois (ligne)
  - Auteurs les plus actifs (barres)
  - Tags populaires (donut)
- ✅ Accessible uniquement aux Admins

### 6. Gestion des Utilisateurs (Admin)
- ✅ Liste de tous les utilisateurs
- ✅ Modification des rôles
- ✅ Suppression d'utilisateurs
- ✅ Visualisation des articles par utilisateur

### 7. Sécurité
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Protection CORS
- ✅ Rate limiting (protection DDoS)
- ✅ Protection XSS (xss-clean)
- ✅ Protection injection MongoDB (mongo-sanitize)
- ✅ Protection HTTP Parameter Pollution (hpp)
- ✅ Headers de sécurité (helmet)
- ✅ Validation et sanitization des entrées

## 📁 Structure du Projet

```
BlogTest/
├── Backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── config/            # Configuration (DB, Swagger)
│   │   ├── controllers/       # Logique métier
│   │   ├── middleware/        # Auth, validation, erreurs
│   │   ├── models/            # Modèles Mongoose
│   │   ├── routes/            # Routes Express
│   │   ├── sockets/           # Handlers Socket.io
│   │   ├── validators/        # Validation des entrées
│   │   ├── app.js             # Configuration Express
│   │   └── server.js          # Point d'entrée
│   ├── tests/                 # Tests Jest + Supertest
│   ├── .env                   # Variables d'environnement
│   ├── package.json
│   └── README.md
│
├── Frontend/                   # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, guards, interceptors
│   │   │   ├── features/      # Modules fonctionnels
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   ├── shared/        # Composants partagés
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/      # Configuration environnement
│   │   └── main.ts
│   ├── e2e/                   # Tests Playwright
│   ├── jest.config.ts         # Configuration Jest
│   ├── playwright.config.ts   # Configuration Playwright
│   ├── package.json
│   └── README.md
│
├── ARCHITECTURE.md            # Documentation architecture
└── README.md                  # Ce fichier
```

## 🛠️ Installation et Configuration

### Prérequis

- **Node.js** v18+ ([Télécharger](https://nodejs.org/))
- **MongoDB** v6+ ([Télécharger](https://www.mongodb.com/try/download/community))
- **npm** ou **yarn**
- **Git**

### 1. Cloner le Projet

```bash
git clone <repository-url>
cd BlogTest
```

### 2. Configuration du Backend

```bash
cd Backend

# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
REFRESH_TOKEN_SECRET=votre-refresh-secret-super-securise-changez-moi
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Démarrer MongoDB (si pas déjà démarré)
# Sur Linux/Mac:
sudo systemctl start mongod
# Ou:
mongod

# Démarrer le serveur backend
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`

### 3. Configuration du Frontend

```bash
cd Frontend

# Installer les dépendances
npm install

# Installer les navigateurs Playwright (pour les tests e2e)
npx playwright install

# Démarrer l'application Angular
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

### 4. Vérification de l'Installation

1. **Backend API**: Ouvrir `http://localhost:3000/api-docs` pour voir la documentation Swagger
2. **Frontend**: Ouvrir `http://localhost:4200` pour accéder à l'application
3. **WebSocket**: Les connexions Socket.io s'établiront automatiquement

## 🧪 Tests

### Tests Backend

```bash
cd Backend

# Exécuter tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec couverture
npm test -- --coverage
```

**Tests implémentés:**
- Tests unitaires des contrôleurs
- Tests d'intégration des routes API
- Tests des middlewares (auth, validation)
- Tests des modèles Mongoose
- Tests Socket.io

### Tests Frontend

```bash
cd Frontend

# Tests unitaires (Jest)
npm test

# Tests unitaires en mode watch
npm run test:watch

# Tests e2e (Playwright)
# Terminal 1: Démarrer l'app
npm start

# Terminal 2: Lancer les tests
npm run e2e

# Tests e2e en mode UI
npx playwright test --ui

# Tests e2e en mode debug
npx playwright test --debug
```

**Tests implémentés:**
- Test de sanité de base (Jest)
- Test e2e de vérification du titre (Playwright)

## 📖 Documentation API

### Accès à la Documentation Swagger

Une fois le backend démarré, accédez à la documentation interactive:

**URL**: `http://localhost:3000/api-docs`

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh-token` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/profile` - Profil utilisateur

#### Articles
- `GET /api/articles` - Liste des articles (pagination, recherche, filtres)
- `GET /api/articles/:id` - Détail d'un article
- `POST /api/articles` - Créer un article (Auth: Author+)
- `PUT /api/articles/:id` - Modifier un article (Auth: Owner/Editor/Admin)
- `DELETE /api/articles/:id` - Supprimer un article (Auth: Admin)
- `POST /api/articles/:id/like` - Liker/unliker un article

#### Commentaires
- `GET /api/comments/article/:articleId` - Commentaires d'un article
- `POST /api/comments` - Créer un commentaire
- `PUT /api/comments/:id` - Modifier un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire
- `POST /api/comments/:id/like` - Liker/unliker un commentaire

#### Utilisateurs (Admin)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détail d'un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

#### Notifications
- `GET /api/notifications` - Mes notifications
- `GET /api/notifications/unread-count` - Nombre non lu
- `PATCH /api/notifications/:id/read` - Marquer comme lu
- `PATCH /api/notifications/read-all` - Tout marquer comme lu
- `DELETE /api/notifications/:id` - Supprimer

### Événements WebSocket

- `comment:new` - Nouveau commentaire créé
- `comment:update` - Commentaire modifié
- `comment:delete` - Commentaire supprimé
- `comment:like` - Like sur commentaire
- `notification` - Nouvelle notification (envoyée à l'utilisateur spécifique)

## 🎯 Guide de Démarrage Rapide

### Créer un Compte et Tester

1. **Démarrer MongoDB, Backend et Frontend** (voir sections précédentes)

2. **Créer un compte Admin** (via API ou directement en base):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "ADMIN"
  }'
```

3. **Se connecter sur le frontend**:
   - Ouvrir `http://localhost:4200`
   - Cliquer sur "Login"
   - Email: `admin@example.com`
   - Password: `Admin123!`

4. **Explorer les fonctionnalités**:
   - Créer des articles
   - Ajouter des commentaires
   - Voir les notifications en temps réel
   - Accéder au dashboard (Admin)
   - Gérer les utilisateurs (Admin)

## 🔐 Système de Rôles et Permissions

| Fonctionnalité              | ADMIN | EDITOR | AUTHOR | READER |
|-----------------------------|-------|--------|--------|--------|
| Créer un article            | ✅    | ✅     | ✅     | ❌     |
| Modifier son article        | ✅    | ✅     | ✅     | ❌     |
| Modifier tous les articles  | ✅    | ✅     | ❌     | ❌     |
| Supprimer un article        | ✅    | ❌     | ❌     | ❌     |
| Commenter                   | ✅    | ✅     | ✅     | ✅     |
| Liker articles/commentaires | ✅    | ✅     | ✅     | ✅     |
| Gérer les utilisateurs      | ✅    | ❌     | ❌     | ❌     |
| Accéder au dashboard        | ✅    | ❌     | ❌     | ❌     |

## 🏗️ Architecture

Le projet suit une architecture MEAN stack classique avec séparation claire des responsabilités:

### Backend (API REST + WebSocket)
- **Couche Routes**: Définition des endpoints
- **Couche Middleware**: Auth, validation, sécurité
- **Couche Controllers**: Logique métier
- **Couche Models**: Schémas et validation MongoDB
- **Couche Socket**: Gestion temps réel

### Frontend (SPA Angular)
- **Core**: Services, guards, interceptors
- **Features**: Modules fonctionnels (articles, auth, dashboard, etc.)
- **Shared**: Composants réutilisables
- **Models**: Interfaces TypeScript

Pour plus de détails, voir [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Déploiement

### Backend (Production)

```bash
cd Backend

# Build (si nécessaire)
# Pas de build pour Node.js, mais s'assurer que les dépendances sont installées
npm ci --production

# Variables d'environnement de production
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog
export JWT_SECRET=<secret-securise>
export REFRESH_TOKEN_SECRET=<secret-securise>
export FRONTEND_URL=https://votre-domaine.com

# Démarrer avec PM2 (recommandé)
npm install -g pm2
pm2 start src/server.js --name blog-api

# Ou démarrer directement
npm start
```

### Frontend (Production)

```bash
cd Frontend

# Build pour production
npm run build

# Les fichiers sont générés dans dist/demo
# Déployer avec nginx, Apache, ou service cloud (Netlify, Vercel, etc.)

# Exemple nginx:
# Copier dist/demo/* vers /var/www/html
# Configurer nginx pour servir les fichiers statiques
```

### Docker (Optionnel)

Les Dockerfiles sont présents dans chaque dossier:

```bash
# Backend
cd Backend
docker build -t blog-backend .
docker run -p 3000:3000 --env-file .env blog-backend

# Frontend
cd Frontend
docker build -t blog-frontend .
docker run -p 80:80 blog-frontend
```

## 📊 Métriques du Projet

### Backend
- **Lignes de code**: ~3000+
- **Endpoints API**: 25+
- **Modèles de données**: 5
- **Middlewares**: 10+
- **Tests**: Unitaires + Intégration

### Frontend
- **Composants**: 15+
- **Services**: 7
- **Guards**: 2
- **Interceptors**: 1
- **Routes**: 10+
- **Tests**: Jest + Playwright configurés

## 🔧 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier le statut
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod

# Vérifier les logs
sudo journalctl -u mongod
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur CORS
- Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend
- Vérifier que le frontend utilise la bonne URL backend dans `environment.ts`

### WebSocket ne se connecte pas
- Vérifier que le backend est démarré
- Vérifier la console du navigateur pour les erreurs
- Vérifier que le token JWT est valide

## 🤝 Contribution

Ce projet est une démonstration technique pour le test MEAN Stack.

## 📝 Licence

MIT

## 👨‍💻 Auteur

Développé dans le cadre du test technique MEAN Stack - Blog IEG

---

**Documentation complète:**
- [Backend README](./Backend/README.md)
- [Frontend README](./Frontend/README.md)
- [Architecture détaillée](./ARCHITECTURE.md)
