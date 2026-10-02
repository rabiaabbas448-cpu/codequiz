import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import API from "../api/axios";

const BrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 2a3.5 3.5 0 0 0-3.5 3.5v1a2.5 2.5 0 0 0-1.5 4.6 2.5 2.5 0 0 0 1 4.5 3.5 3.5 0 0 0 3.5 3.4h.5V2h0Z" />
    <path d="M14.5 2a3.5 3.5 0 0 1 3.5 3.5v1a2.5 2.5 0 0 1 1.5 4.6 2.5 2.5 0 0 1-1 4.5 3.5 3.5 0 0 1-3.5 3.4H14V2h.5Z" />
  </svg>
);
const BoltIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />
  </svg>
);
const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
  </svg>
);

const FEATURES = [
  { icon: <BrainIcon />, title: "Level-Based Quizzes", text: "Beginner to Advanced questions tailored to your level." },
  { icon: <BoltIcon />, title: "Earn XP & Badges", text: "Get rewarded for every quiz you complete." },
  { icon: <ChartIcon />, title: "Track Your Progress", text: "See your performance and watch yourself improve." },
];

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalCategories: null, totalQuestions: null });

  useEffect(() => {
    API.get("/admin/public-stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-inner">
          <h1>Learn Coding. Test Your Skills. Level Up.</h1>
          <p className="hero-subtitle">Practice coding with interactive quizzes.</p>

          {!user && (
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn-secondary">Login</Link>
            </div>
          )}
          {user && user.role === "student" && (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          )}
          {user && user.role === "admin" && (
            <Link to="/admin/dashboard" className="btn-primary">Go to Admin Dashboard</Link>
          )}

          <div className="hero-stats">
            <div><strong>{stats.totalCategories ?? "-"}</strong><span>Categories</span></div>
            <div><strong>{stats.totalQuestions ?? "-"}</strong><span>Questions</span></div>
            <div><strong>3</strong><span>Levels</span></div>
            <div><strong>AI</strong><span>Explanations</span></div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;