import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-3xl font-bold">Welcome to Auralith</h1>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
