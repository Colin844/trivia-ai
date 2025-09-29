# Trivia AI

Une application de quiz interactif avec génération de questions par intelligence artificielle, construite avec React et Node.js.

## Fonctionnalités

### Création de Quiz

- **Création intuitive** : Interface simple pour créer des quiz personnalisés
- **Génération IA** : Génération automatique de questions avec l'IA (OpenAI/Gemma)
- **Gestion d'images** : Support d'images pour les quiz
- **Questions variées** : Support de questions à choix multiples avec timing personnalisé

### Gestion des Utilisateurs

- **Authentification** : Système complet d'inscription/connexion avec JWT
- **Profils utilisateur** : Gestion des comptes personnalisés
- **Quiz privés/publics** : Contrôle de la visibilité des quiz

### Expérience de Jeu

- **Interface moderne** : Design responsive avec Tailwind CSS
- **Recherche avancée** : Recherche et filtrage des quiz
- **Tableau de bord** : Gestion centralisée des quiz créés

### Fonctionnalités Techniques

- **Base de données SQLite** : Stockage avec Sequelize ORM
- **API RESTful** : Backend Express.js bien structuré
- **Protection des routes** : Middleware d'authentification
- **Gestion d'état** : Context API React pour l'état global

## Stack Technique

### Frontend

- **React 19** avec Hooks
- **Vite** pour le build et développement
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Axios** pour les requêtes HTTP
- **React Icons** pour les icônes

### Backend

- **Node.js** avec Express.js
- **SQLite** avec Sequelize ORM
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **OpenAI API** pour la génération de questions
- **CORS** pour la communication cross-origin

## Utilisation

### 1. Créer un compte

- Accédez à la page d'inscription
- Renseignez vos informations (nom, email, mot de passe)
- Connectez-vous avec vos identifiants

### 2. Créer un quiz

- Cliquez sur "Créer un quiz" sur la page d'accueil
- Ajoutez un titre et une image
- Créez des questions avec plusieurs réponses possibles
- Utilisez l'IA pour générer des questions automatiquement
- Sauvegardez votre quiz

### 3. Gérer vos quiz

- Accédez à "Mes Quiz" via le menu profil
- Modifiez, supprimez ou publiez vos quiz
- Contrôlez la visibilité (public/privé)

### 4. Générer des questions avec l'IA

- Dans l'éditeur de quiz, utilisez le champ "Contexte IA"
- Exemple : "Ajouter des questions sur l'histoire de France"
- L'IA génère automatiquement des questions pertinentes

### 5. Participer et hoster des quizs

#### Rejoindre une partie

- Sur la page d'accueil, entrez le PIN de la partie dans le champ dédié
- Cliquez sur "Rejoindre la partie" pour accéder à la salle d'attente
- Attendez que l'hôte lance le quiz pour commencer à jouer

#### Hoster une partie

- Accédez à l'un de vos quiz créés
- Cliquez sur "Démarrer une partie" pour générer un PIN unique
- Partagez le PIN avec les participants
- Gérez la partie depuis l'interface hôte (démarrer, pause, résultats)
- Consultez le tableau de bord en temps réel avec les scores des joueurs

#### Pendant le jeu

- Répondez aux questions dans le temps imparti
- Suivez votre progression et votre score
- Consultez le classement final à la fin de la partie

## API Endpoints

### Authentification

- `POST /api/user/register` - Inscription
- `POST /api/user/login` - Connexion
- `GET /api/user/me` - Profil utilisateur

### Quiz

- `GET /api/quizz` - Liste des quiz
- `POST /api/quizz` - Créer un quiz
- `GET /api/quizz/:id` - Détails d'un quiz
- `PUT /api/quizz/:id` - Modifier un quiz
- `DELETE /api/quizz/:id` - Supprimer un quiz
- `PATCH /api/quizz/:id/public` - Changer visibilité
- `POST /api/quizz/generate-ai` - Générer questions IA

## Déploiement

### Production Build

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## Fonctionnalités à venir

- Mode multijoueur en temps réel
- Système de points et classements
- Catégories de quiz

## Problèmes connus

- La génération IA peut parfois produire du JSON invalide
- La génération IA est limitée à 10 demandes par heure
- Les images sont stockées en base64 (limite de taille)
- Traduction automatique par Google empêhce le fonctionnement de l'application

## Équipe

- **Développeur Frontend/Backend** - Samuel Nepveu, Lucas Pomerleau, Colin Leblanc
- **Contribution IA** - Integration Gemma avec AI/ML API

---
