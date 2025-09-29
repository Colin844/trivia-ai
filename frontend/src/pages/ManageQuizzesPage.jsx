import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import QuizCard from "../components/QuizCard";
import { useLoading } from "../contexts/LoadingContext";
import {
  HiPlus,
  HiSearch,
  HiDocumentText,
  HiGlobeAlt,
  HiQuestionMarkCircle,
  HiInformationCircle,
  HiRefresh,
} from "react-icons/hi";

const ManageQuizzes = () => {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get("/quizz?scope=mine");
      const quizzesData = response.data;

      const quizzesWithDetails = await Promise.all(
        quizzesData.map(async (quiz) => {
          try {
            const detailResponse = await axiosInstance.get(`/quizz/${quiz.id}`);
            return {
              ...quiz,
              __source: "mine",
              questionCount: detailResponse.data.questions?.length || 0,
              image: detailResponse.data.image || null,
            };
          } catch (error) {
            console.warn(`Error loading quiz details ${quiz.id}:`, error);
            return {
              ...quiz,
              __source: "mine",
              questionCount: 0,
              image: null,
            };
          }
        })
      );

      // mark quizzes as owned
      setQuizzes(quizzesWithDetails.map((q) => ({ ...q, isOwner: true })));
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setError("Error loading quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleQuizUpdated = (updatedQuiz) => {
    setQuizzes((prevQuizzes) =>
      prevQuizzes.map((quiz) =>
        quiz.id === updatedQuiz.id ? updatedQuiz : quiz
      )
    );
  };

  const handleQuizDeleted = (quizId) => {
    setQuizzes((prevQuizzes) =>
      prevQuizzes.filter((quiz) => quiz.id !== quizId)
    );
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description &&
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateQuiz = () => {
    navigate("/create-quiz");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white rounded-2xl shadow-xl p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <p className="text-gray-700 text-lg font-medium">
                Loading your quizzes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white rounded-2xl shadow-xl p-8">
              <div className="text-red-500 text-2xl font-bold mb-6">
                {error}
              </div>
              <button
                onClick={loadQuizzes}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3 focus:ring-4 focus:ring-blue-500/25 outline-none"
              >
                <HiRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              My Quizzes
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your quizzes: create, edit, publish and delete your
              quizzes.
            </p>
          </div>
          <button
            onClick={handleCreateQuiz}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3 border-0 outline-none focus:ring-4 focus:ring-blue-500/25"
          >
            <HiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create New Quiz
          </button>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search your quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl outline-none"
            />
            <HiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
                <HiDocumentText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {quizzes.length}
                </div>
                <div className="text-gray-600 font-medium">Total Quizzes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200">
                <HiGlobeAlt className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {quizzes.filter((quiz) => quiz.is_public).length}
                </div>
                <div className="text-gray-600 font-medium">Public Quizzes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200">
                <HiQuestionMarkCircle className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {quizzes.reduce(
                    (total, quiz) => total + quiz.questionCount,
                    0
                  )}
                </div>
                <div className="text-gray-600 font-medium">Total Questions</div>
              </div>
            </div>
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <HiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No Quizzes Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No quizzes match your search "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/25 outline-none"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                  <HiDocumentText className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No Quizzes Created
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any quizzes yet. Get started now!
                </p>
                <button
                  onClick={handleCreateQuiz}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3 focus:ring-4 focus:ring-blue-500/25 outline-none"
                >
                  <HiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Create My First Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                isOwner={true}
                onQuizUpdated={handleQuizUpdated}
                onQuizDeleted={handleQuizDeleted}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100">
                <HiInformationCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Tip</h4>
            </div>
            <p className="text-gray-600">
              Publish your quizzes to make them accessible to all users. Private
              quizzes are only visible to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageQuizzes;
