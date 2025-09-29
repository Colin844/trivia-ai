import { Router } from "express";
import userController from "../controllers/userControllers.js";
import authMiddleware from "../middleware/userAuth.js";

const r = Router();

// Routes publiques
r.post("/register", userController.register);
r.post("/login", userController.login);

// Routes protégées
r.get("/me", authMiddleware.verifyToken, userController.getCurrentUser);
r.get("/:id", authMiddleware.verifyToken, userController.getUserById);
r.put("/:id", authMiddleware.verifyToken, userController.updateUserById);
r.delete("/:id", authMiddleware.verifyToken, userController.deleteUserById);

export default r;
