import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const QuizHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    API.get("/attempts/my")
      .then((res) => setAttempts(res.data.attempts))
      .catch(() => setError("Could not load quiz history."))
      .finally(() => setLoading(false));
  }, []);

  const sortedAttempts = [...attempts].sort((a, b) => {
    if (sortBy === "score") return b.percentage - a.percentage;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) return <div className="page-loading">Loading history...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="quiz-history-page">
      <h1>Quiz History</h1>

      <div className="history-sort">
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Most Recent</option>
          <option value="score">Highest Score</option>
        </select>
      </div>

      {sortedAttempts.length === 0 && <p>You haven't attempted any quizzes yet.</p>}

      <table className="history-table">
        <thead>
          <tr>
            <th>Quiz</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Date</th>
            <th>Time Taken</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedAttempts.map((a) => (
            <tr key={a._id}>
              <td>{a.quiz?.title || "Deleted Quiz"}</td>
              <td>{a.quiz?.category?.name || "-"}</td>
              <td>{a.quiz?.difficulty || "-"}</td>
              <td>{a.score}</td>
              <td>{a.percentage}%</td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td>{Math.round(a.timeTaken / 60)} min</td>
              <td>
                <Link to={`/quizzes/review/${a._id}`} className="btn-link">
                  View Result
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuizHistory;