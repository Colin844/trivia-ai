import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Searchbar from "./Searchbar";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
  };

  const handleAccount = () => {
    console.log("Navigate to account page");
  };

  const handleTrivia = () => {
    navigate("/manage-quizzes");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg shadow-neutral-600/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className="flex items-center gap-3 w-full">
          <Searchbar />
          <button onClick={() => navigate('/quiz/search')} className="hidden md:inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm">Discovery</button>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          onClick={handleLogoClick}
        >
          Trivia AI
        </h1>
      </div>
      <div className="flex items-center flex-1 justify-end">
        {token ? (
          <ProfileDropdown
            onLogout={handleLogout}
            onAccount={handleAccount}
            onTrivia={handleTrivia}
          />
        ) : (
          <button
            onClick={handleLoginClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
