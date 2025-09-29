// routes/triviaRoutes.js
import { Router } from "express";
import {
  createTrivia,
  getTrivia,
  listTrivias,
  updateTrivia,
  deleteTrivia,
  setPublicFlag,
  generateQuizAI,
} from "../controllers/quizzControllers.js";

const r = Router();

// Exemples d’auth: r.use(requireAuthMiddleware)

r.get("/", listTrivias);                    // ?scope=public | ?scope=mine
r.post("/", createTrivia);                  // body: quiz payload
r.get("/:id", getTrivia);
r.put("/:id", updateTrivia);                // replace nested Q/A
r.patch("/:id/public", setPublicFlag);      // { is_public: boolean }
r.delete("/:id", deleteTrivia);
r.post("/generate-ai", generateQuizAI);    // <-- nouvelle route

export default r;
