  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
  import { useAuth } from "./context/AuthContext";
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import Onboarding from "./pages/Onboarding";
  import Dashboard from "./pages/Dashboard";
  import EditProfile from "./pages/EditProfile";
  import Matches from "./pages/Matches";
  import ChatRoom from "./pages/ChatRoom";

  export default function App() {
    const { isAuthenticated, authReady } = useAuth();

    if (!authReady) return <div className="text-center mt-20 text-purple-700">Loading...</div>;

    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:matchId" element={<ChatRoom />} />
        </Routes>
      </Router>
    );
  }
