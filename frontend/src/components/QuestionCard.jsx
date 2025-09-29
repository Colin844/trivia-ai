// components/QuestionCard.jsx
import React from "react";
import { FaTrash } from "react-icons/fa";

export default function QuestionCard({
  q,
  idx,
  openIndex,
  setOpenIndex,
  onQuestionChange,
  onAnswerChange,
  onCorrectAnswer,
  onAddAnswer,
  onDeleteQuestion,
  onDeleteAnswer,
}) {
  const isOpen = openIndex === idx;

  return (
    <div className="border rounded">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setOpenIndex(isOpen ? null : idx)}
      >
        <span className="font-semibold">{q.text || `Question ${idx + 1}`}</span>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-red-100"
            title="Delete question"
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteQuestion) onDeleteQuestion(idx);
            }}
          >
            <FaTrash className="text-red-500" />
          </button>
          <span>{isOpen ? "▲" : "▼"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t space-y-2">
          <input
            type="text"
            value={q.text}
            onChange={(e) => onQuestionChange(idx, "text", e.target.value)}
            placeholder="Question text"
            className="border rounded px-2 py-1 w-full mb-2"
          />

          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <span>Points:</span>
              <input
                type="number"
                min={1}
                value={q.points}
                onChange={(e) => onQuestionChange(idx, "points", Number(e.target.value))}
                className="border rounded px-2 py-1 w-20"
              />
            </label>

            <label className="flex items-center gap-2">
              <span>Time (s):</span>
              <input
                type="number"
                min={5}
                value={q.time}
                onChange={(e) => onQuestionChange(idx, "time", Number(e.target.value))}
                className="border rounded px-2 py-1 w-20"
              />
            </label>
          </div>

          <div>
            <span className="font-semibold">Answers:</span>
            {q.answers.map((a, aIdx) => (
              <div key={aIdx} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={a.text}
                  onChange={(e) => onAnswerChange(idx, aIdx, e.target.value)}
                  placeholder={`Answer ${aIdx + 1}`}
                  className="border rounded px-2 py-1 flex-1"
                />
                <input
                  type="radio"
                  checked={a.isCorrect}
                  onChange={() => onCorrectAnswer(idx, aIdx)}
                  name={`correct-${idx}`}
                />
                <span className="text-xs">Correct</span>
                <button
                  className="p-1 rounded hover:bg-red-100"
                  title="Delete answer"
                  onClick={() => onDeleteAnswer(idx, aIdx)}
                >
                  <FaTrash className="text-red-500" />
                </button>
              </div>
            ))}

            <button
              className="mt-2 px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
              onClick={() => onAddAnswer(idx)}
            >
              Add answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
