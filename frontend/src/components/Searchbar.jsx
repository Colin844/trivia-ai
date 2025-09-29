import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Searchbar = ({ onSearch }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const routeQuery = params.query ? decodeURIComponent(params.query) : (location.state && location.state.query) || "";
  const [query, setQuery] = useState(routeQuery || "");

  // keep input in sync if the route changes
  useEffect(() => {
    setQuery(routeQuery || "");
  }, [routeQuery]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (query || "").trim();

    // On search page: navigate to /quiz/search or /quiz/search/:query
   

    // From other pages: redirect to search page and embed query in URL
    if (trimmed.length === 0) {
      navigate("/quiz/search");
    } else {
      navigate(`/quiz/search/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form className="relative w-full mx-auto max-w-md" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={"Search quizzes..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      <button
        type="submit"
        aria-label="submit-search"
        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer flex items-center"
      >
        <FaSearch size={16} color="#888" />
      </button>
    </form>
  );
};

export default Searchbar;