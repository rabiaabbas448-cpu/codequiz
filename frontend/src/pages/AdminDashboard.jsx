import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const StudentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
  </svg>
);
const CategoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const QuizIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
  </svg>
);
const QuestionIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3 2.4c-.7.2-1.3.8-1.3 1.6v.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.6" fill="currentColor" />
  </svg>
);
const AttemptIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 11l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const ScoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
  </svg>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load admin stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: <StudentIcon />, link: "/admin/students" },
    { label: "Total Categories", value: stats.totalCategories, icon: <CategoryIcon />, link: "/admin/categories" },
    { label: "Total Quizzes", value: stats.totalQuizzes, icon: <QuizIcon />, link: "/admin/quizzes" },
    { label: "Total Questions", value: stats.totalQuestions, icon: <QuestionIcon />, link: "/admin/questions" },
    { label: "Total Attempts", value: stats.totalAttempts, icon: <AttemptIcon />, link: null },
    { label: "Average Score", value: `${stats.averageScore}%`, icon: <ScoreIcon />, link: null },
  ];

  return (
    <div className="admin-dashboard-page">
      <h1>Admin Dashboard</h1>
      <p className="admin-dashboard-subtitle">An overview of your platform's activity.</p>

      <div className="admin-stats-grid">
        {cards.map((c, i) =>
          c.link ? (
            <Link
              key={c.label}
              to={c.link}
              className="admin-stat-card admin-stat-clickable fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className={`admin-stat-icon icon-${i % 5}`}>{c.icon}</span>
              <div>
                <p className="admin-stat-value">{c.value}</p>
                <p className="admin-stat-label">{c.label}</p>
              </div>
            </Link>
          ) : (
            <div key={c.label} className="admin-stat-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className={`admin-stat-icon icon-${i % 5}`}>{c.icon}</span>
              <div>
                <p className="admin-stat-value">{c.value}</p>
                <p className="admin-stat-label">{c.label}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;