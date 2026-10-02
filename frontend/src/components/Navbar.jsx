import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        CodeQuiz
      </Link>

      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-nav-primary">
              Register
            </Link>
          </>
        )}

        {user && user.role === "student" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/topics">Topics</Link>
            <Link to="/history">History</Link>
            <Link to="/performance">Performance</Link>
            <Link to="/profile">Profile</Link>
            <button className="btn-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/categories">Categories</Link>
            <Link to="/admin/generate-questions">Generate Questions</Link>
            <Link to="/admin/questions">Questions</Link>
            <Link to="/admin/students">Students</Link>
            <button className="btn-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;