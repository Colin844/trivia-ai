import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);

  // Load user/token from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedUsername) {
      setUsername(storedUsername);
      setToken(storedToken);
    } else {
      setUsername(null);
      setToken(null);
    }
  }, []);

  // Login: save user/token to state and localStorage
  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  };

  // Logout: clear state and localStorage
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
