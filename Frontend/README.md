# Blog IEG - Angular Frontend

Plateforme de Blog IEG multi-auteurs avec gestion avancée des permissions, commentaires en temps réel et tableau de bord analytique.

## Technologies Utilisées

- **Angular 20** - Framework frontend
- **TypeScript** - Langage de programmation
- **Socket.io Client** - Communication temps réel
- **Chart.js** - Visualisation de données
- **RxJS** - Programmation réactive

## Fonctionnalités Implémentées

### 1. Authentification & Gestion des Utilisateurs

- **Inscription/Connexion** avec validation de formulaire
- **JWT + Refresh Token** pour l'authentification sécurisée
- **Système de rôles dynamiques**:
  - **Admin**: Gestion complète (utilisateurs, tous les articles, dashboard)
  - **Éditeur**: Modification de tous les articles
  - **Rédacteur**: Modification de ses propres articles uniquement
  - **Lecteur**: Lecture et commentaires
- **Interface de gestion des rôles** (Admin uniquement)

### 2. Gestion des Articles (CRUD Avancé)

- **Création d'articles** avec titre, contenu, image, et tags
- **Modification d'articles** avec permissions basées sur le rôle
- **Suppression d'articles** (Admin uniquement)
- **Liste paginée** avec recherche et filtrage
- **Affichage détaillé** avec toutes les métadonnées
- **Permissions dynamiques**:
  - Éditeur/Admin → modifier tous les articles
  - Rédacteur → modifier seulement ses articles
  - Admin → supprimer des articles

### 3. Commentaires en Temps Réel

- **WebSocket (Socket.io)** pour les mises à jour instantanées
- **Commentaires imbriqués** (réponses aux commentaires)
- **Notifications en temps réel** pour les auteurs
- **Interface intuitive** pour commenter et répondre
- **Suppression de commentaires** par l'auteur

### 4. Dashboard Analytics (Bonus)

- **Statistiques générales**:
  - Total d'articles
  - Total de commentaires
  - Total d'utilisateurs
- **Graphiques interactifs**:
  - Articles publiés par mois (graphique linéaire)
  - Auteurs les plus actifs (graphique en barres)
  - Tags populaires (graphique en donut)
- Accessible uniquement aux Admins

### 5. Sécurité & Bonnes Pratiques

- **Intercepteur HTTP** pour l'authentification automatique
- **Guards de route** pour protéger les pages
- **Validation des formulaires** côté client
- **Gestion des erreurs** avec messages appropriés
- **Refresh token automatique** en cas d'expiration
- **CORS** prêt pour l'intégration backend

## Structure du Projet

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   └── services/
│   │       ├── analytics.service.ts
│   │       ├── article.service.ts
│   │       ├── auth.service.ts
│   │       ├── comment.service.ts
│   │       ├── notification.service.ts
│   │       ├── user.service.ts
│   │       └── websocket.service.ts
│   ├── features/
│   │   ├── articles/
│   │   │   ├── article-detail/
│   │   │   ├── article-form/
│   │   │   └── article-list/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── comments/
│   │   │   └── comment-section/
│   │   ├── dashboard/
│   │   └── users/
│   │       └── user-list/
│   ├── models/
│   │   ├── article.model.ts
│   │   ├── comment.model.ts
│   │   ├── notification.model.ts
│   │   └── user.model.ts
│   ├── shared/
│   │   └── components/
│   │       └── navbar/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── main.ts
```

## Installation et Exécution

### Prérequis

- Node.js (v18+)
- npm ou yarn
- Backend API en cours d'exécution (voir configuration ci-dessous)

### Installation

```bash
# Installer les dépendances
npm install
```

### Configuration

Modifier les fichiers d'environnement pour pointer vers votre API backend:

**src/environments/environment.ts** (développement):

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api", // URL de votre API
  wsUrl: "http://localhost:3000", // URL WebSocket
};
```

**src/environments/environment.prod.ts** (production):

```typescript
export const environment = {
  production: true,
  apiUrl: "/api",
  wsUrl: "",
};
```

### Démarrage en Développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

### Build pour Production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/demo`

## Routes de l'Application

| Route                | Accès                                 | Description                |
| -------------------- | ------------------------------------- | -------------------------- |
| `/login`             | Public                                | Page de connexion          |
| `/register`          | Public                                | Page d'inscription         |
| `/articles`          | Authentifié                           | Liste des articles         |
| `/articles/new`      | Authentifié (Admin/Éditeur/Rédacteur) | Créer un article           |
| `/articles/:id`      | Authentifié                           | Détail d'un article        |
| `/articles/:id/edit` | Authentifié (Permissions)             | Modifier un article        |
| `/dashboard`         | Admin uniquement                      | Tableau de bord analytique |
| `/users`             | Admin uniquement                      | Gestion des utilisateurs   |

## API Backend Attendue

L'application s'attend à ce que le backend fournisse les endpoints suivants:

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Refresh token

### Articles

- `GET /api/articles` - Liste des articles (avec pagination, recherche, filtres)
- `GET /api/articles/:id` - Détail d'un article
- `POST /api/articles` - Créer un article
- `PUT /api/articles/:id` - Modifier un article
- `DELETE /api/articles/:id` - Supprimer un article
- `GET /api/articles/my-articles` - Mes articles

### Commentaires

- `GET /api/comments/article/:articleId` - Commentaires d'un article
- `POST /api/comments` - Créer un commentaire
- `PUT /api/comments/:id` - Modifier un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire

### Utilisateurs

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détail d'un utilisateur
- `PUT /api/users/:id/role` - Modifier le rôle
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `PUT /api/users/profile` - Modifier son profil

### Notifications

- `GET /api/notifications` - Mes notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `PUT /api/notifications/read-all` - Tout marquer comme lu
- `DELETE /api/notifications/:id` - Supprimer

### Analytics

- `GET /api/analytics` - Statistiques globales

### WebSocket Events

- `connect` - Connexion établie
- `join-article` - Rejoindre un article
- `leave-article` - Quitter un article
- `new-comment` - Nouveau commentaire
- `notification` - Nouvelle notification

## Choix Techniques et Architecture

### Architecture Modulaire

- **Standalone Components** (Angular 20) pour une meilleure tree-shaking
- **Lazy Loading** pour optimiser les performances
- **Services partagés** pour la logique métier
- **Guards et Interceptors** pour la sécurité

### Gestion de l'État

- **Signals** (Angular 20) pour l'état réactif
- **BehaviorSubject** pour les flux de données
- **RxJS** pour les opérations asynchrones

### Sécurité

- **JWT avec Refresh Token** pour l'authentification
- **HTTP Interceptor** pour l'injection automatique du token
- **Guards de route** pour les permissions
- **Validation des formulaires** pour la saisie utilisateur

### Performance

- **Lazy Loading** des routes
- **OnPush Change Detection** où approprié
- **Production Build** avec optimisation et minification

### Temps Réel

- **Socket.io Client** pour les communications WebSocket
- **Subscription Management** pour éviter les fuites mémoire
- **Reconnexion automatique** en cas de déconnexion

### Design Responsive

- **Mobile-first** approach
- **Flexbox et Grid** pour les layouts
- **Media queries** pour l'adaptabilité
- **Touch-friendly** pour les appareils mobiles

## Fonctionnalités Bonus Implémentées

✅ **Dashboard Analytics** avec Chart.js pour visualiser les statistiques

✅ **Système de notifications** en temps réel

✅ **Interface responsive** optimisée pour mobile et desktop

✅ **Gestion avancée des permissions** avec UI adaptative

✅ **Design moderne** avec animations et transitions



### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/demo /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contribution

Ce projet est une démonstration technique pour le test MEAN Stack. Pour toute question ou amélioration, veuillez créer une issue.

## Licence

MIT
