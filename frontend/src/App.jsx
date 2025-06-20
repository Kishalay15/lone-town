import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={isAuthenticated() ? <Onboarding /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/edit-profile" element={<EditProfile />} />

      </Routes>
    </Router>
  );
}
