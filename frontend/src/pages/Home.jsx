import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBullseye, FaRocket, FaStar, FaBrain } from "react-icons/fa";

const Home = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Limite à 6 caractères et n'accepte que les chiffres
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
      setError("");
    }
  };

  const handleJoin = () => {
    if (pin.length === 6) {
      // Logique pour rejoindre la partie avec le PIN
      console.log("Joining game with PIN:", pin);
      // navigate(`/game/${pin}`);
    } else {
      setError("PIN must be 6 digits");
    }
  };

  const handleCreateQuiz = () => {
    navigate("/create-quiz");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Trivia AI
          </h1>
          <p className="text-xl text-gray-600">
            Create intelligent quizzes or join exciting games
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Zone 1: Saisie du PIN */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBullseye className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Join a Game
              </h2>
              <p className="text-sm text-gray-600">
                Enter the 6-digit PIN to join
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          </div>

          {/* Zone 2: Bouton Rejoindre */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-2xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Ready to Play?
              </h2>
              <p className="text-sm text-gray-600">
                Click when your PIN is complete
              </p>
            </div>

            <button
              onClick={handleJoin}
              disabled={pin.length !== 6}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                pin.length === 6
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Join Game
            </button>
          </div>

          {/* Zone 3: Créer un quiz */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-2xl text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Create Quiz
              </h2>
              <p className="text-sm text-gray-600">
                Design your own AI-powered quiz
              </p>
            </div>

            <button
              onClick={handleCreateQuiz}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              Create New Quiz
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            Powered by artificial intelligence for smarter questions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
