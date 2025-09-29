// controllers/triviaController.js
import { sequelize } from "../db/index.js";
import { Trivia } from "../models/Trivia.js";
import { Question } from "../models/Question.js";
import { Answer } from "../models/Answer.js";
import { OpenAI } from "openai";
import JSON5 from "json5"; // npm install json5

/**
 * Format attendu côté front pour CREATE/UPDATE:
 * {
 *   title: string,
 *   description?: string,
 *   is_public?: boolean,
 *   questions: [
 *     {
 *       statement: string,
 *       points?: number,
 *       time_limit_s?: number,
 *       position?: number,
 *       answers: [{ text: string, is_correct: boolean }, ...]
 *     }, ...
 *   ]
 * }
 */

// Helpers
function validateQuizPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
  if (!payload.title || !Array.isArray(payload.questions)) throw new Error("title & questions are required");
  payload.questions.forEach((q, i) => {
    if (!q.statement) throw new Error(`Question #${i + 1} missing 'statement'`);
    if (!Array.isArray(q.answers) || q.answers.length === 0)
      throw new Error(`Question #${i + 1} must have at least 1 answer`);
    const hasCorrect = q.answers.some((a) => !!a.is_correct);
    if (!hasCorrect) throw new Error(`Question #${i + 1} must have at least 1 correct answer`);
  });
}

// CREATE (with nested questions/answers)
export async function createTrivia(req, res) {
  const t = await sequelize.transaction();
  try {
    const owner_user_id = req.user?.id || req.body.owner_user_id;
    const payload = req.body;
    validateQuizPayload(payload);

    // Ajoute l'image au quiz
    const trivia = await Trivia.create(
      {
        title: payload.title,
        description: payload.description || null,
        owner_user_id,
        image: payload.image || null, // <-- AJOUT
        is_public: payload.is_public ?? true,
      },
      { transaction: t }
    );

    for (let i = 0; i < payload.questions.length; i++) {
      const q = payload.questions[i];
      const question = await Question.create(
        {
          trivia_id: trivia.id,
          statement: q.statement,
          type: q.type || "multiple_choice",
          time_limit_s: q.time_limit_s ?? 30,
          points: q.points ?? 1000,
          position: q.position ?? i + 1,
        },
        { transaction: t }
      );

      const answersToCreate = q.answers.map((a) => ({
        question_id: question.id,
        text: a.text,
        is_correct: !!a.is_correct,
      }));
      await Answer.bulkCreate(answersToCreate, { transaction: t });
    }

    await t.commit();
    const created = await Trivia.findByPk(trivia.id, {
      include: { model: Question, as: "questions", include: { model: Answer, as: "answers" } },
    });
    return res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    return res.status(400).json({ error: String(err.message || err) });
  }
}

// READ one (with nested)
export async function getTrivia(req, res) {
  try {
    const trivia = await Trivia.findByPk(req.params.id, {
      include: { model: Question, as: "questions", include: { model: Answer, as: "answers" } },
      order: [
        [{ model: Question, as: "questions" }, "position", "ASC"],
        [{ model: Question, as: "questions" }, { model: Answer, as: "answers" }, "id", "ASC"],
      ],
    });
    if (!trivia) return res.status(404).json({ error: "Trivia not found" });
    return res.json(trivia);
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}

// LIST (owned or public)
export async function listTrivias(req, res) {
  try {
    const owner_user_id = req.user?.id;
    const where = {};
    if (req.query.scope === "mine" && owner_user_id) {
      where.owner_user_id = owner_user_id;
    } else if (req.query.scope === "public") {
      where.is_public = true;
    }
    const items = await Trivia.findAll({
      where,
      attributes: ["id", "title", "description", "is_public", "owner_user_id", "created_at", "updated_at"],
      order: [["created_at", "DESC"]],
    });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}

// UPDATE full (replace questions/answers)
export async function updateTrivia(req, res) {
  const t = await sequelize.transaction();
  try {
    const trivia = await Trivia.findByPk(req.params.id);
    if (!trivia) {
      await t.rollback();
      return res.status(404).json({ error: "Trivia not found" });
    }
    if (req.user?.id !== trivia.owner_user_id) return res.status(403).json({ error: "Forbidden" });

    const payload = req.body;
    validateQuizPayload(payload);

    // Ajoute l'image au quiz lors de la mise à jour
    await trivia.update(
      {
        title: payload.title,
        description: payload.description || null,
        image: payload.image || trivia.image, // <-- AJOUT
        is_public: payload.is_public ?? trivia.is_public,
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // remove existing Q/A then recreate (simpler/safer for now)
    const oldQuestions = await Question.findAll({ where: { trivia_id: trivia.id }, transaction: t });
    const oldQuestionIds = oldQuestions.map((q) => q.id);
    if (oldQuestionIds.length) {
      await Answer.destroy({ where: { question_id: oldQuestionIds }, transaction: t });
      await Question.destroy({ where: { trivia_id: trivia.id }, transaction: t });
    }

    for (let i = 0; i < payload.questions.length; i++) {
      const q = payload.questions[i];
      const question = await Question.create(
        {
          trivia_id: trivia.id,
          statement: q.statement,
          type: q.type || "multiple_choice",
          time_limit_s: q.time_limit_s ?? 30,
          points: q.points ?? 1000,
          position: q.position ?? i + 1,
        },
        { transaction: t }
      );

      const answersToCreate = q.answers.map((a) => ({
        question_id: question.id,
        text: a.text,
        is_correct: !!a.is_correct,
      }));
      await Answer.bulkCreate(answersToCreate, { transaction: t });
    }

    await t.commit();
    const updated = await Trivia.findByPk(trivia.id, {
      include: { model: Question, as: "questions", include: { model: Answer, as: "answers" } },
      order: [
        [{ model: Question, as: "questions" }, "position", "ASC"],
        [{ model: Question, as: "questions" }, { model: Answer, as: "answers" }, "id", "ASC"],
      ],
    });
    return res.json(updated);
  } catch (err) {
    await t.rollback();
    return res.status(400).json({ error: String(err.message || err) });
  }
}

// DELETE
export async function deleteTrivia(req, res) {
  const t = await sequelize.transaction();
  try {
    const trivia = await Trivia.findByPk(req.params.id, { transaction: t });
    if (!trivia) {
      await t.rollback();
      return res.status(404).json({ error: "Trivia not found" });
    }
    // Optionnel: check ownership
    if (req.user?.id !== trivia.owner_user_id) return res.status(403).json({ error: "Forbidden" });

    // cascade via FK + onDelete or manuellement:
    const qs = await Question.findAll({ where: { trivia_id: trivia.id }, transaction: t });
    const qIds = qs.map((q) => q.id);
    if (qIds.length) await Answer.destroy({ where: { question_id: qIds }, transaction: t });
    await Question.destroy({ where: { trivia_id: trivia.id }, transaction: t });
    await Trivia.destroy({ where: { id: trivia.id }, transaction: t });

    await t.commit();
    return res.json({ ok: true });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ error: String(err.message || err) });
  }
}

// Toggle public/private
export async function setPublicFlag(req, res) {
  try {
    const trivia = await Trivia.findByPk(req.params.id);
    if (!trivia) return res.status(404).json({ error: "Trivia not found" });
    // if (req.user?.id !== trivia.owner_user_id) return res.status(403).json({ error: "Forbidden" });

    const is_public = !!req.body.is_public;
    await trivia.update({ is_public, updated_at: new Date() });
    return res.json({ id: trivia.id, is_public });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}

// Générer un quiz avec l'IA
export async function generateQuizAI(req, res) {
  try {
    const { trivia, context } = req.body;
    // Prompt ultra optimisé
    const prompt = `
      Tu es un assistant expert en création de quiz. Voici le quiz actuel au format JSON :
      ${JSON.stringify(trivia, null, 2)}

      Contexte utilisateur : ${context}

      Ta tâche :
      - Analyse le titre, la description et les questions existantes.
      - Si le titre, une question existante ou le contexte utilisateur est dans une langue (ex: anglais, espagnol, arabe, etc.), alors la nouvelle question doit être générée dans cette même langue.
      - Ajoute UNE question pertinente et originale à la liste "questions", en respectant le style et la difficulté du quiz.
      - Chaque question doit avoir au moins 3 réponses, dont une correcte (is_correct: true).
      - Utilise UNIQUEMENT des guillemets standards (") pour le JSON, jamais de guillemets typographiques.
      - Retourne STRICTEMENT le quiz complet au format JSON, avec la nouvelle question ajoutée à la liste "questions".
      - NE FOURNIS AUCUN TEXTE, EXPLICATION OU COMMENTAIRE EN DEHORS DU JSON.
      - Le JSON doit être parfaitement valide et prêt à être parsé par JSON.parse en JavaScript.
      - Utilise UNIQUEMENT des guillemets doubles (") pour toutes les propriétés et valeurs du JSON.
      - N’utilise JAMAIS d’underscore, d’espace ou de caractères spéciaux autour des noms de propriétés ou des valeurs.
      - Toutes les propriétés doivent être correctement orthographiées (ex: "is_correct", pas "is_correect").
      - Le JSON doit être parfaitement valide et prêt à être parsé par JSON.parse en JavaScript.
      - Si tu ne respectes pas ces règles, ta réponse ne sera pas acceptée.

      Exemple attendu :
      {
        "title": "...",
        "description": "...",
        "questions": [
          ...questions existantes...,
          {
            "statement": "...",
            "points": 150,
            "time": 30,
            "position": ...,
            "answers": [
              { "text": "...", "is_correct": true },
              { "text": "...", "is_correct": false },
              { "text": "...", "is_correct": false }
            ]
          }
        ]
      }
    `;

    const api = new OpenAI({
      baseURL: 'https://api.aimlapi.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await api.chat.completions.create({
     // model: 'gpt-4o-mini',
      model: 'google/gemma-3n-e4b-it',
     // model:"openai/gpt-5-nano-2025-08-07",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 1,
      max_tokens: 1536,
      top_k: 50,
    });

    let quizJson = result.choices[0].message.content;

    // Remplace les underscores et espaces autour des propriétés
    quizJson = quizJson.replace(/_([a-zA-Z0-9]+)_\s*:/g, '"$1":');
    quizJson = quizJson.replace(/:\s*_([^_]+)_/g, ': "$1"');

    // Corrige les guillemets typographiques
    quizJson = quizJson.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
    quizJson = quizJson.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

    // Corrige les propriétés mal orthographiées
    quizJson = quizJson.replace(/is_correect/g, 'is_correct');

    // Nettoie le début et la fin de la réponse IA
    quizJson = quizJson.trim();

    // Retire les balises de code et le mot 'json' éventuel
    if (quizJson.startsWith("```json")) {
      quizJson = quizJson.replace(/^```json/, "");
    }
    if (quizJson.startsWith("```")) {
      quizJson = quizJson.replace(/^```/, "");
    }
    if (quizJson.endsWith("```")) {
      quizJson = quizJson.replace(/```$/, "");
    }

    // Retire les retours à la ligne inutiles
    quizJson = quizJson.trim();

    // Tente de parser
    try {
      console.log("AI raw response:", quizJson);
      const quiz = JSON5.parse(quizJson);
      return res.json(quiz);
    } catch (e) {
      console.error("JSON parse error:", e);
      return res.status(400).json({ error: "Invalid JSON from AI", raw: quizJson });
    }
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
}

// Synchronise tous les modèles
sequelize.sync({ alter: true }) // ou { force: true } pour tout recréer
  .then(() => {
    console.log("Database synced!");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
