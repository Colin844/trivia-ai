import QuestionCard from "./QuestionCard";

const QuizQuestions = ({
  quizData,
  setQuizData,
  openIndex,
  setOpenIndex,
  showToast,
  onSave,
  quizId,
}) => {
  const handleAddQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", points: 150, time: 30, answers: [] },
      ],
    }));
    showToast("Question added", "success");
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      );
      return { ...prev, questions };
    });
  };

  const handleAnswerChange = (qIdx, aIdx, value) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const answers = q.answers.map((a, j) =>
          j === aIdx ? { ...a, text: value } : a
        );
        return { ...q, answers };
      });
      return { ...prev, questions };
    });
  };

  const handleCorrectAnswer = (qIdx, aIdx) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const answers = q.answers.map((a, j) => ({
          ...a,
          isCorrect: j === aIdx,
        }));
        return { ...q, answers };
      });
      return { ...prev, questions };
    });
  };

  const handleAddAnswer = (qIdx) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const last = q.answers[q.answers.length - 1];
        const lastIsEmptyDraft =
          last && last.text === "" && last.isCorrect === false;
        if (lastIsEmptyDraft) return q;
        return {
          ...q,
          answers: [...q.answers, { text: "", isCorrect: false }],
        };
      });
      return { ...prev, questions };
    });
    showToast("Answer added", "success");
  };

  // AJOUT : suppression d'une question
  const handleDeleteQuestion = (idx) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
    showToast("Question deleted", "info");
    if (openIndex === idx) setOpenIndex(null);
  };

  // AJOUT : suppression d'une réponse
  const handleDeleteAnswer = (qIdx, aIdx) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, answers: q.answers.filter((_, j) => j !== aIdx) };
      });
      return { ...prev, questions };
    });
    showToast("Answer deleted", "info");
  };

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">Quiz Questions</h2>
      <div className="space-y-4">
        {quizData.questions.map((q, idx) => (
          <QuestionCard
            key={idx}
            q={q}
            idx={idx}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            onQuestionChange={handleQuestionChange}
            onAnswerChange={handleAnswerChange}
            onCorrectAnswer={handleCorrectAnswer}
            onAddAnswer={handleAddAnswer}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteAnswer={handleDeleteAnswer}
          />
        ))}
      </div>
      <div className="flex gap-2 mt-6">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
          onClick={handleAddQuestion}
        >
          Add question
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          onClick={onSave}
        >
          {quizId ? "Save" : "Create quiz"}
        </button>
      </div>
    </section>
  );
};

export default QuizQuestions;
