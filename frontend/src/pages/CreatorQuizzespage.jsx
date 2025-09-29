import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/QuizSidebar";
import QuizQuestions from "../components/QuizQuestions";
import Toast from "../components/Toast";
import axiosInstance from "../utils/axiosInstance";
import { useLoading } from "../contexts/LoadingContext";

const defaultQuizData = {
  title: "New Quiz",
  isOnline: false,
  image: "",
  questions: [],
};

const Createurpage = ({ mode }) => {
  const [quizData, setQuizData] = useState(defaultQuizData);
  const [quizId, setQuizId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [toast, setToast] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (mode === "edit" && id) {
      showLoading("Loading quiz...", true);
      axiosInstance
        .get(`/quizz/${id}`)
        .then((res) => {
          setQuizId(res.data.id);
          setQuizData({
            title: res.data.title,
            isOnline: res.data.is_public,
            image: res.data.image || "",
            questions: res.data.questions.map((q) => ({
              text: q.statement,
              points: q.points,
              time: q.time_limit_s,
              answers: q.answers.map((a) => ({
                text: a.text,
                isCorrect: a.is_correct,
              })),
            })),
          });
        })
        .catch(() => showToast("Quiz not found or access denied.", "error"))
        .finally(() => hideLoading());
    }
  }, [mode, id]);

  const showToast = (text, variant = "info", duration = 2200) => {
    setToast({ text, variant });
    setTimeout(() => setToast(null), duration);
  };

  const handleSave = async () => {
    // Validations de base
    if (
      !quizData.title ||
      quizData.title.trim() === "" ||
      quizData.title === "New Quiz"
    ) {
      showToast("Please enter a quiz name.", "error");
      return;
    }
    if (!quizData.image || typeof quizData.image !== "string") {
      showToast("Please add an image (string URL/base64).", "error");
      return;
    }
    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      showToast("Please add at least one question.", "error");
      return;
    }
    for (const q of quizData.questions) {
      if (!Array.isArray(q.answers) || q.answers.length < 2) {
        showToast("Each question must have at least two answers.", "error");
        return;
      }
      if (!q.answers.some((a) => !!a.isCorrect)) {
        showToast(
          "Each question must have at least one correct answer.",
          "error"
        );
        return;
      }
    }

    // Sanitize helpers (aucun undefined dans le payload)
    const toStringSafe = (v) => (v == null ? "" : String(v));
    const toNumberSafe = (v, def = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };
    const toBoolSafe = (v) => !!v;

    // Construit un payload 100% JSON-safe
    const payload = {
      title: toStringSafe(quizData.title).trim(),
      is_public: toBoolSafe(quizData.isOnline),
      image: toStringSafe(quizData.image),
      questions: quizData.questions.map((q, idx) => ({
        statement: toStringSafe(q.text).trim(),
        points: toNumberSafe(q.points, 0),
        time_limit_s: toNumberSafe(q.time, 30),
        position: idx + 1,
        answers: (q.answers || []).map((a) => ({
          text: toStringSafe(a.text).trim(),
          is_correct: toBoolSafe(a.isCorrect),
        })),
      })),
    };

    // Supprime les réponses vides (texte vide) si besoin
    payload.questions.forEach((q) => {
      q.answers = q.answers.filter((a) => a.text !== "");
    });

    showLoading(
      mode === "create" ? "Creating quiz..." : "Saving quiz...",
      true
    );

    try {
      if (mode === "create") {
        // owner_user_id facultatif → seulement si défini
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          try {
            const user = JSON.parse(rawUser);
            if (user && user.id) {
              payload.owner_user_id = user.id;
            }
          } catch {
            /* ignore */
          }
        }

        const res = await axiosInstance.post("/quizz/", payload, {
          headers: { "Content-Type": "application/json" },
          transformResponse: [(data, headers) => data],
        });
        console.log("Create quiz response:", res);
        let created = {};
        try {
          if (typeof res.data === "string") {
            created = JSON.parse(res.data);
          } else if (res.data) {
            created = res.data;
          } else if (typeof res === "string") {
            created = JSON.parse(res);
          } else {
            created = res;
          }
        } catch {
          // si ce n'est pas du JSON, on ignore et tente quand même de continuer
        }
        console.log("Parsed create quiz data:", created);
        const newId = created.id;
        console.log("New quiz ID:", newId);
        if (!newId) {
          // on retente de lire depuis un header Location, selon l'implémentation back
          // sinon on notifie seulement succès sans redirection forcée
          showToast("Quiz created (no id returned).", "success");
        } else {
          setQuizId(newId);
          showToast("Quiz created!", "success");
          navigate(`/edit-quiz/${newId}`);
        }
      } else {
        await axiosInstance.put(`/quizz/${quizId}`, payload, {
          headers: { "Content-Type": "application/json" },
          transformResponse: [(data, headers) => data], // idem
        });
        showToast("Quiz saved!", "success");
      }
    } catch (err) {
      // Logging utile pour comprendre le retour du back
      const msg = err?.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data)
        : err?.message || String(err);

      console.error("Save quiz error:", {
        message: err?.message,
        responseStatus: err?.response?.status,
        responseData: err?.response?.data,
        configData: err?.config?.data,
      });

      showToast("Error saving quiz. " + msg, "error");
    } finally {
      hideLoading();
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizId) return;
    showLoading("Deleting quiz...", true);
    try {
      await axiosInstance.delete(`/quizz/${quizId}`);
      showToast("Quiz deleted!", "success");
      navigate("/");
    } catch (err) {
      showToast("Error deleting quiz.", "error");
    } finally {
      hideLoading();
    }
  };

  const handleGenerateAIQuestion = async (context, clearInput) => {
    showLoading("Generating AI questions...", true);
    try {
      const res = await axiosInstance.post("/quizz/generate-ai", {
        trivia: {
          title: quizData.title,
          description: quizData.description || "",
          questions: quizData.questions.map((q, idx) => ({
            statement: q.text,
            points: q.points,
            time_limit_s: q.time,
            position: idx + 1,
            answers: q.answers.map((a) => ({
              text: a.text,
              is_correct: a.isCorrect,
            })),
          })),
        },
        context,
      });

      const aiQuestions = res.data.questions || [];
      const oldQuestions = quizData.questions;

      const newQuestions = aiQuestions.filter(
        (aiQ) =>
          !oldQuestions.some(
            (oldQ) =>
              oldQ.text === aiQ.statement &&
              oldQ.answers.length === aiQ.answers.length &&
              oldQ.answers.every(
                (a, i) =>
                  a.text === aiQ.answers[i].text &&
                  a.isCorrect === aiQ.answers[i].is_correct
              )
          )
      );

      if (newQuestions.length > 0) {
        setQuizData((prev) => ({
          ...prev,
          questions: [
            ...prev.questions,
            ...newQuestions.map((q) => ({
              text: q.statement,
              points: q.points,
              time: q.time_limit_s,
              answers: q.answers.map((a) => ({
                text: a.text,
                isCorrect: a.is_correct,
              })),
            })),
          ],
        }));
        showToast(
          `${newQuestions.length} AI question(s) generated!`,
          "success"
        );
      } else {
        showToast("No new questions generated.", "info");
      }
      if (clearInput) clearInput();
    } catch (err) {
      showToast("AI generation failed.", "error");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-min bg-gray-50">
      <Sidebar
        quizData={quizData}
        setQuizData={setQuizData}
        editingName={editingName}
        setEditingName={setEditingName}
        showToast={showToast}
        fileInputRef={fileInputRef}
        onDeleteQuiz={handleDeleteQuiz}
        onGenerateAIQuestion={handleGenerateAIQuestion}
      />
      <main className="flex-1 p-4 md:p-6 h-min">
        <QuizQuestions
          quizData={quizData}
          setQuizData={setQuizData}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
          showToast={showToast}
          onSave={handleSave}
          quizId={quizId}
        />
      </main>
      <Toast toast={toast} />
    </div>
  );
};

export default Createurpage;
