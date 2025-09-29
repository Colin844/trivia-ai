import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import {
  HiDotsVertical, HiPlay, HiPencil, HiTrash, HiGlobeAlt, HiLockClosed,
  HiCheck, HiX, HiLightBulb
} from "react-icons/hi";

const FLIP_MS = 500; // doit matcher la transition

const QuizCard = ({ quiz, onQuizUpdated, onQuizDeleted, isOwner: propIsOwner }) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(quiz.title);
  const [isLoading, setIsLoading] = useState(false);

  const [isFlipped, setIsFlipped] = useState(false);   // rotation
  const [showBackUI, setShowBackUI] = useState(false); // fade-in des boutons

  const dropdownRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const flipTimeoutRef = useRef(null);

  const playBtnRef = useRef(null);
  const hostBtnRef = useRef(null);

  // Propriété
  let isOwner = false;
  if (typeof propIsOwner === "boolean") isOwner = propIsOwner;
  else if (quiz && quiz.__source === "mine") isOwner = true;
  else {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = storedUser?.id ?? null;
      isOwner = !!(userId && quiz.owner_user_id && userId === quiz.owner_user_id);
    } catch { isOwner = false; }
  }

  // Actions
  const handlePlay = () => {
    if (isLoading) return;
    setIsFlipped(true);
    clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(
      () => setShowBackUI(true),
      Math.min(320, FLIP_MS - 150)
    );
    requestAnimationFrame(() => hostBtnRef.current?.focus());
  };

  const closeBack = () => {
    setShowBackUI(false);
    clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => setIsFlipped(false), 160);
    requestAnimationFrame(() => playBtnRef.current?.focus());
  };

  const startAsHost = () => navigate(`/room/${quiz.id}/waitingroom`, { state: { mode: "host" } });
  const startSolo  = () => navigate(`/room/${quiz.id}/waitingroom`, { state: { mode: "solo" } });
  const handleEdit = () => navigate(`/edit-quiz/${quiz.id}`);

  // Dropdown
  const toggleOptions = () => { if (isOwner) setShowOptions(!showOptions); };
  useEffect(() => {
    if (!showOptions) return;
    const onDocDown = (e) => {
      if (dropdownRef.current?.contains(e.target)) return;
      if (toggleBtnRef.current?.contains(e.target)) return;
      setShowOptions(false);
    };
    const onKey = (e) => e.key === "Escape" && setShowOptions(false);
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showOptions]);

  // ESC pour revenir
  useEffect(() => {
    if (!isFlipped) return;
    const onKey = (e) => e.key === "Escape" && closeBack();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isFlipped]);

  // Sécurité focus
  useEffect(() => {
    if (isFlipped) {
      if (!(document.activeElement instanceof HTMLElement) ||
          !document.activeElement.closest(".quiz-back")) {
        hostBtnRef.current?.focus();
      }
    } else {
      if (!(document.activeElement instanceof HTMLElement) ||
          !document.activeElement.closest(".quiz-front")) {
        playBtnRef.current?.focus();
      }
    }
  }, [isFlipped]);

  useEffect(() => () => clearTimeout(flipTimeoutRef.current), []);

  // API
  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      const resp = await axiosInstance.get(`/quizz/${quiz.id}`);
      const fullQuiz = resp.data;
      const payload = {
        title: fullQuiz.title,
        is_public: !fullQuiz.is_public,
        image: fullQuiz.image || "",
        questions: (fullQuiz.questions || []).map((q, idx) => ({
          statement: q.statement, points: q.points, time_limit_s: q.time_limit_s, position: idx + 1,
          answers: (q.answers || []).map((a) => ({ text: a.text, is_correct: a.is_correct }))
        }))
      };
      await axiosInstance.put(`/quizz/${quiz.id}`, payload);
      onQuizUpdated({ ...quiz, is_public: !quiz.is_public });
      setShowOptions(false);
    } catch (e) {
      console.error(e); alert("Erreur lors de la publication du quiz");
    } finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) return;
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/quizz/${quiz.id}`);
      onQuizDeleted(quiz.id);
      setShowOptions(false);
    } catch (e) {
      console.error(e); alert("Erreur lors de la suppression du quiz");
    } finally { setIsLoading(false); }
  };

  const handleRename = async () => {
    if (newTitle.trim() === "" || newTitle === quiz.title) {
      setIsRenaming(false); setNewTitle(quiz.title); return;
    }
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/quizz/${quiz.id}`);
      const fullQuiz = response.data;
      await axiosInstance.put(`/quizz/${quiz.id}`, { ...fullQuiz, title: newTitle.trim() });
      onQuizUpdated({ ...quiz, title: newTitle.trim() });
      setIsRenaming(false); setShowOptions(false);
    } catch (e) {
      console.error(e); alert("Erreur lors du renommage du quiz");
      setNewTitle(quiz.title); setIsRenaming(false);
    } finally { setIsLoading(false); }
  };

  const handleCancelRename = () => { setNewTitle(quiz.title); setIsRenaming(false); };

  // --- RENDER ---
  // Hauteur fixe pour éviter le reflow pendant le flip (ajuste si besoin)
  const CARD_HEIGHT = 300;

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      {/* INNER qui porte la rotation */}
      <div
        className="relative "
        style={{
          height: CARD_HEIGHT,
          transformStyle: "preserve-3d",
          willChange: "transform",
          transition: `transform ${FLIP_MS}ms cubic-bezier(.4,2,.3,1)`,
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FACE AVANT */}
        <div
          className="quiz-front quiz-front-visual absolute inset-0 bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden group hover:-translate-y-1 transition-transform "
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)"
          }}
          inert={isFlipped ? "" : undefined}
        >
          {showOptions && <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />}
          {showOptions && (
            <div
              ref={dropdownRef}
              className="absolute right-12 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[160px] backdrop-blur-sm"
            >
              {!isOwner ? (
                <div className="p-3 text-sm text-gray-500">No actions available</div>
              ) : (
                <>
                  <button
                    onClick={handleTogglePublish}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200 disabled:opacity-50"
                  >
                    {quiz.is_public ? (
                      <>
                        <HiLockClosed className="w-4 h-4 text-gray-600" />
                        <span>Make private</span>
                      </>
                    ) : (
                      <>
                        <HiGlobeAlt className="w-4 h-4 text-green-600" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsRenaming(true)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors duration-200 disabled:opacity-50"
                  >
                    <HiPencil className="w-4 h-4 text-blue-600" />
                    <span>Rename</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 text-sm flex items-center gap-3 transition-colors duration-200 disabled:opacity-50"
                  >
                    <HiTrash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}

          <div className="h-36 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
            {quiz.image ? (
              <img src={quiz.image} alt={quiz.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-white">
                <HiLightBulb className="w-16 h-16 opacity-90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="p-4 quiz-front ">
            <div className="flex items-center justify-between mb-2 ">
              {isRenaming ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") handleCancelRename();
                    }}
                    className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button onClick={handleRename} disabled={isLoading} className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200">
                    <HiCheck className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancelRename} disabled={isLoading} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 truncate flex-1 pr-2">{quiz.title}</h3>
                  {isOwner && (
                    <button
                      ref={toggleBtnRef}
                      onClick={toggleOptions}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <HiDotsVertical className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>

            {quiz.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2 leading-tight">{quiz.description}</p>
            )}

            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-gray-500">{quiz.questionCount || 0} questions</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${quiz.is_public ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}`}>
                {quiz.is_public ? "Public" : "Private"}
              </span>
            </div>

            <div className="flex gap-2 ">
              <button
                ref={playBtnRef}
                onClick={handlePlay}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <HiPlay className="w-4 h-4" />
                Play
              </button>
              {isOwner && (
                <button onClick={handleEdit} disabled={isLoading} className="bg-gray-200 hover:bg-gray-250 text-gray-800 py-2 px-3 rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <HiPencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FACE ARRIÈRE */}
        <div
          className="quiz-back absolute inset-0 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-6"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
          inert={!isFlipped ? "" : undefined}
        >
          <button aria-label="close" onClick={closeBack} className="absolute top-3 right-3 p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <HiX className="w-4 h-4" />
          </button>

          <h4 className="text-lg font-semibold mb-3 text-gray-800 select-none">Join as</h4>

          <div className={`flex gap-3 items-center transition-opacity duration-300 ${showBackUI ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <button ref={hostBtnRef} onClick={startAsHost} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Host</button>
            <span>Or</span>
            <button onClick={startSolo} className="px-4 py-2 bg-gray-100 rounded-lg">Solo</button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          </div>
        )}
      </div>

      {/* Motion réduit */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .quiz-front-visual { transition: none !important; }
        }
      `}</style>
    </div>
  );
};

export default QuizCard;
