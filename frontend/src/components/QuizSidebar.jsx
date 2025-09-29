import { FaEdit, FaTrash } from "react-icons/fa";
import GenerateAIQuestion from "./GenerateAIQuestion";

const QuizSidebar = ({
  quizData,
  setQuizData,
  editingName,
  setEditingName,
  showToast,
  fileInputRef,
  onDeleteQuiz, 
  onGenerateAIQuestion,
  loading,
}) => {
  const handleTitleChange = (e) => setQuizData((prev) => ({ ...prev, title: e.target.value }));
  const handleRename = () => setEditingName(true);
  const handleTitleKeyDown = (e) => { if (e.key === "Enter") setEditingName(false); };
  const handleDelete = () => {
    if (onDeleteQuiz) onDeleteQuiz();
  };
  const handleToggleOnline = () => {
    setQuizData((prev) => ({ ...prev, isOnline: !prev.isOnline }));
    showToast(`Quiz is now ${!quizData.isOnline ? "Online" : "Offline"}`, "success");
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuizData((prev) => ({
        ...prev,
        image: reader.result, // string base64
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-full md:w-72 flex flex-col gap-4 p-4 bg-white border-r h-min">
      <div className="mb-4 flex flex-col items-center">
        <div
          className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 flex items-center justify-center rounded mb-2 overflow-hidden cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Click to change image"
        >
          {quizData.image ? (
            <img src={quizData.image} alt="Quiz" className="w-full h-full object-cover rounded" />
          ) : (
            <span className="text-gray-500">No image</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
      <div className="flex items-center w-full justify-between mb-4">
        {editingName ? (
          <input
            type="text"
            value={quizData.title}
            onChange={handleTitleChange}
            onBlur={() => setEditingName(false)}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            placeholder="Quiz name"
            className="border rounded px-2 py-1 flex-1"
          />
        ) : (
          <span className="font-bold text-lg flex-1">{quizData.title}</span>
        )}
        <div className="flex items-center gap-2 ml-2">
          <button className="p-2 rounded hover:bg-gray-200" title="Rename" onClick={handleRename}><FaEdit /></button>
          <button className="p-2 rounded hover:bg-gray-200" title="Delete" onClick={handleDelete}><FaTrash /></button>
          <label className="flex items-center cursor-pointer ml-2">
            <input type="checkbox" checked={quizData.isOnline} onChange={handleToggleOnline} className="hidden" />
            <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${quizData.isOnline ? "bg-green-400" : ""}`}>
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${quizData.isOnline ? "translate-x-5" : ""}`}></span>
            </span>
            <span className="ml-2 text-xs">{quizData.isOnline ? "Online" : "Offline"}</span>
          </label>
        </div>
      </div>
      {/* Génération IA */}
      <div className="w-full">
        <GenerateAIQuestion
          onGenerateAIQuestion={onGenerateAIQuestion}
          loading={loading}
        />
      </div>
      
    </aside>
  );
};

export default QuizSidebar;