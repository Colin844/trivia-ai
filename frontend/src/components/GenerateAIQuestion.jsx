import { useState } from "react";
import { FaMagic } from "react-icons/fa";

const GenerateAIQuestion = ({ onGenerateAIQuestion, loading }) => {
  const [context, setContext] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (context.trim() && onGenerateAIQuestion) {
      onGenerateAIQuestion(context.trim(), () => setContext("")); 
    }
  };

  return (
    <form className="w-full flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
      <input
        type="text"
        value={context}
        onChange={e => setContext(e.target.value)}
        placeholder="Context or instruction for AI (e.g. 'Add questions about history')"
        className="border rounded px-2 py-1"
        disabled={loading}
      />
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        disabled={loading || !context.trim()}
      >
        <FaMagic className="text-lg" />
        {loading ? "Generating..." : "Generate question(s)"}
      </button>
    </form>
  );
};

export default GenerateAIQuestion;