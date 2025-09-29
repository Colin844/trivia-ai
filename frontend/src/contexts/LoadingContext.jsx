import React, { createContext, useContext, useState } from "react";
import LoadingOverlay from "../components/LoadingOverlay";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Chargement...");
  const [transparent, setTransparent] = useState(false);

  const showLoading = (msg = "Chargement...", isTransparent = false) => {
    setText(msg);
    setTransparent(isTransparent);
    setLoading(true);
  };
  const hideLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, text, transparent, showLoading, hideLoading }}>
      {children}
      <LoadingOverlay loading={loading} text={text} transparent={transparent} />
    </LoadingContext.Provider>
  );
};