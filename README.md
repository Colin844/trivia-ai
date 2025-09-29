# Trivia AI

**Trivia AI** est une application web de quiz interactif qui utilise l'intelligence artificielle pour générer automatiquement des questions. Construite avec **React** et **Node.js**, elle inclut une base de données SQLite et un système complet de gestion d’utilisateurs.

## Fonctionnalités

### Création de Quiz
- **Interface intuitive** pour créer des quiz personnalisés
- **Génération automatique** de questions avec l’IA (OpenAI/Gemma)
- **Support d’images** et questions à choix multiples avec timing personnalisé

### Gestion des Utilisateurs
- **Inscription et connexion** sécurisées (JWT)
- **Profils utilisateurs** personnalisés
- **Contrôle de visibilité** des quiz (public/privé)

### Expérience de Jeu
- Interface moderne et **responsive** avec Tailwind CSS
- Recherche et filtrage de quiz
- Tableau de bord pour gérer ses quiz

### Aspects Techniques
- Backend Node.js avec Express.js et API RESTful
- Base de données SQLite via Sequelize ORM
- Middleware d’authentification et gestion d’état avec React Context API

## Stack Technique

**Frontend :** React 19, Vite, Tailwind CSS, React Router, Axios, React Icons  
**Backend :** Node.js, Express.js, SQLite (Sequelize), JWT, bcryptjs, OpenAI API  

## Utilisation

1. **Créer un compte** : inscription et connexion sécurisées  
2. **Créer un quiz** : ajouter titre, image, questions manuelles ou générées par IA  
3. **Gérer ses quiz** : modification, suppression, publication, contrôle visibilité  
4. **Participer ou hoster un quiz** : entrer un PIN ou générer un PIN pour une partie  
5. **Suivre les scores** : tableau de bord en temps réel pour l’hôte et classement final pour les joueurs  

## API Endpoints

- Authentification : `/api/user/register`, `/api/user/login`, `/api/user/me`  
- Quiz : `/api/quizz` (GET, POST, PUT, DELETE, PATCH), `/api/quizz/generate-ai`

## Déploiement

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
````

Fonctionnalités à venir
- Mode multijoueur en temps réel
- Système de points et classement
- Catégories de quiz

Problèmes connus
- La génération IA peut produire du JSON invalide

- Limite de 10 requêtes IA par heure

- Images stockées en base64 (limite de taille)

- Traduction automatique par Google peut perturber l’affichage

Équipe
Frontend/Backend : Samuel Nepveu, Lucas Pomerleau, Colin Leblanc

IA/ML : Intégration Gemma avec API AI
