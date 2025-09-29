import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Header from "../components/Header.jsx";
import Home from "../pages/Home.jsx";
import LoginPage from "../pages/AuthPages/LoginPage/LoginPage.jsx";
import RegisterPage from "../pages/AuthPages/RegisterPage/RegisterPage.jsx";
import Createurpage from "../pages/CreatorQuizzespage.jsx";
import ManageQuizzes from "../pages/ManageQuizzesPage.jsx";
import QuizQuestions from "../components/QuizQuestions.jsx";
import WaitingRoom from "../components/WaitingRoom.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import SearchQuizzesPage from "../pages/SearchQuizzesPage.jsx";

// Composant Layout avec Header pour les pages qui en ont besoin
function Layout({ children }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

// Gestion spéciale pour Login/Register si déjà connecté
function PublicOnlyRoute({ children }) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRouter() {
  return (
    <Routes>
      {/* Pages avec Header */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      {/* Routes publiques SANS Header */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Routes protégées AVEC Header */}
      <Route
        path="/create-quiz"
        element={
          <ProtectedRoute>
            <Layout>
              <Createurpage mode="create" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-quizzes"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageQuizzes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-quiz/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Createurpage mode="edit" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/search/:query?"
        element={
          <ProtectedRoute>
            <Layout>
              <SearchQuizzesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId/question/:questionId"
        element={
          <ProtectedRoute>
            <Layout>
              <QuizQuestions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId/waitingroom"
        element={
          <ProtectedRoute>
            <Layout>
              <WaitingRoom />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Leaderboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Redirection pour routes inexistantes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;