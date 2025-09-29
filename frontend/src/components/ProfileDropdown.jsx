import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaCog } from "react-icons/fa";

const ProfileDropdown = ({ onLogout, onAccount, onTrivia }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <FaUserCircle size={22} />
        <FaCog size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setOpen(false);
              onAccount && onAccount();
            }}
          >
            My Account
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setOpen(false);
              onTrivia && onTrivia();
            }}
          >
            My Trivia
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
            onClick={() => {
              setOpen(false);
              onLogout && onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
