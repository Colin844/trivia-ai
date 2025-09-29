import express from 'express';
import DotenvFlow from 'dotenv-flow';
import cors from 'cors';
import userController from './controllers/userControllers.js';
import authMiddleware from './middleware/userAuth.js';
import modAuth from './middleware/modAuth.js';
import triviaRoutes from './routes/quizzRoutes.js';
import { sequelize } from "./db/index.js";
import { User } from "./models/users.js";
import { Trivia } from "./models/Trivia.js";
import { Question } from "./models/Question.js";
import { Answer } from "./models/Answer.js";

DotenvFlow.config();

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';


// Logger middleware pour chaque appel d'API
app.use((req, res, next) => {
  console.log(`[API CALL] ${req.method} ${req.originalUrl}`);
  next();
});

// Configure middleware
app.use(express.json({ limit: '10mb' })); // ou plus si besoin
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
}));

function logger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

app.use(logger);

// Public routes
app.post('/api/user/register', userController.register);
app.post('/api/user/login', userController.login);
app.get('/api/user/:id', userController.getUserById);

// Protected routes
app.use(authMiddleware.verifyToken);
app.use('/api/quizz', triviaRoutes);


app.put('/api/user/:id', userController.updateUserById);
app.delete('/api/user/:id', userController.deleteUserById);


//app.use('/api/admin', modAuth.verifyModerator, adminRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Associations
User.hasMany(Trivia, { foreignKey: "owner_user_id", as: "quizzes" });
Trivia.belongsTo(User, { foreignKey: "owner_user_id", as: "owner" });

Trivia.hasMany(Question, { foreignKey: "trivia_id", as: "questions", onDelete: "CASCADE" });
Question.belongsTo(Trivia, { foreignKey: "trivia_id", as: "trivia" });

Question.hasMany(Answer, { foreignKey: "question_id", as: "answers", onDelete: "CASCADE" });
Answer.belongsTo(Question, { foreignKey: "question_id", as: "question" });

// Synchronisation
sequelize.sync({ force:false ,alert:true}) // ou { force: true } pour tout recréer
  .then(() => console.log("Database synced!"))
  .catch((err) => console.error("Error syncing database:", err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});