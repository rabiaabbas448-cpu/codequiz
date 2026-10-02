import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, categoriesRes] = await Promise.all([
          API.get("/users/dashboard"),
          API.get("/categories"),
        ]);
        setStats(statsRes.data);
        setCategories(categoriesRes.data.categories);
      } catch (err) {
        setError("Could not load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {stats.name}!</h1>
      <p className="dashboard-class">Class: {stats.classLevel}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalAttempts}</span>
          <span className="stat-label">Quizzes Attempted</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.averageScore}%</span>
          <span className="stat-label">Average Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.bestScore}%</span>
          <span className="stat-label">Best Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.xp} XP</span>
          <span className="stat-label">Level {stats.level}</span>
        </div>
      </div>

      <div className="xp-progress-bar">
        <div
          className="xp-progress-fill"
          style={{ width: `${stats.xpProgress.progressPercent}%` }}
        ></div>
      </div>
      <p className="xp-progress-text">
        {stats.xpProgress.next
          ? `${stats.xp} / ${stats.xpProgress.next} XP to next level`
          : "Max level reached!"}
      </p>

      <h2>Quiz Categories</h2>
      <div className="category-grid">
        {categories.map((cat) => (
                    <Link key={cat._id} to={`/learn/${cat._id}/Beginner`} className="category-card">
            {cat.name}
          </Link>
        ))}
      </div>

      {stats.recentAttempts.length > 0 && (
        <>
          <h2>Recent Attempts</h2>
          <ul className="recent-attempts-list">
            {stats.recentAttempts.map((a) => (
              <li key={a._id}>
                Score: {a.percentage}% — {new Date(a.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;