import { useEffect, useState } from "react";
import API from "../api/axios";

const Performance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/users/performance")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load performance data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading performance...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const { categoryPerformance, difficultyPerformance, progressOverTime, overallAverage, totalAttempts, bestCategory } = data;

  if (totalAttempts === 0) {
    return (
      <div className="performance-page">
        <h1>Your Performance</h1>
        <div className="performance-empty">
          <p>You haven't completed any quizzes yet.</p>
          <p className="performance-empty-sub">Start a quiz from Topics to see your performance here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-page">
      <h1>Your Performance</h1>
      <p className="performance-subtitle">A summary of how you're doing across all your quizzes.</p>

      <div className="performance-summary-grid">
        <div className="performance-summary-card">
          <p className="performance-summary-label">Overall Average</p>
          <p className="performance-summary-value">{overallAverage}%</p>
        </div>
        <div className="performance-summary-card">
          <p className="performance-summary-label">Quizzes Completed</p>
          <p className="performance-summary-value">{totalAttempts}</p>
        </div>
        <div className="performance-summary-card">
          <p className="performance-summary-label">Best Category</p>
          <p className="performance-summary-value performance-summary-small">
            {bestCategory ? `${bestCategory.category} (${bestCategory.averagePercentage}%)` : "-"}
          </p>
        </div>
      </div>

      <h2 className="performance-section-title">Category-wise Performance</h2>
      <div className="bar-chart">
        {categoryPerformance.map((c) => (
          <div key={c.category} className="bar-row">
            <span className="bar-label">{c.category}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${c.averagePercentage}%` }}></div>
            </div>
            <span className="bar-value">{c.averagePercentage}%</span>
          </div>
        ))}
      </div>

      <h2 className="performance-section-title">Difficulty-wise Performance</h2>
      <div className="bar-chart">
        {difficultyPerformance.map((d) => (
          <div key={d.difficulty} className="bar-row">
            <span className="bar-label">{d.difficulty}</span>
            <div className="bar-track">
              <div className="bar-fill bar-fill-accent" style={{ width: `${d.averagePercentage}%` }}></div>
            </div>
            <span className="bar-value">{d.averagePercentage}%</span>
          </div>
        ))}
      </div>

      <h2 className="performance-section-title">Progress Over Time</h2>
      <div className="progress-chart">
        {progressOverTime.map((p, i) => (
          <div key={i} className="progress-bar-item">
            <div
              className="progress-bar-vertical"
              style={{ height: `${Math.max(p.percentage, 3)}%` }}
              title={`${p.percentage}% on ${new Date(p.date).toLocaleDateString()}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Performance;