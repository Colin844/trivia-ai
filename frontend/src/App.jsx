import { BrowserRouter as Router } from "react-router-dom";
import { LoadingProvider } from "./contexts/LoadingContext";
import AuthProvider from "./contexts/AuthContext.jsx";
import AppRouter from "./routers/AppRouter.jsx";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Router>
          <AppRouter />
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
