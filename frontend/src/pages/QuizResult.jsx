import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

const QuizResult = () => {
  const { id } = useParams(); // attempt id
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (data) return; // came from attempt submission directly, already have data

    // fallback: if page was reloaded, fetch attempt details instead
    API.get(`/attempts/${id}`)
      .then((res) => {
        const attempt = res.data.attempt;
        setData({
          attempt,
          xpEarned: attempt.xpEarned,
          newBadges: [],
        });
      })
      .finally(() => setLoading(false));
  }, [id, data]);

  if (loading) return <div className="page-loading">Loading result...</div>;
  if (!data) return <div className="error-message">Result not found.</div>;

  const { attempt, xpEarned, newBadges } = data;

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You really know your stuff.";
    if (percentage >= 70) return "Great job! Keep it up.";
    if (percentage >= 50) return "Good effort! A bit more practice will help.";
    return "Keep practicing — you'll improve with each attempt.";
  };

  return (
    <div className="quiz-result-page">
      <h1>Quiz Completed!</h1>

      <div className="result-score">
        <span className="result-score-value">
          {attempt.score} / {attempt.correctAnswers + attempt.wrongAnswers + attempt.unanswered}
        </span>
        <span className="result-percentage">{attempt.percentage}%</span>
      </div>

      <p className="result-message">{getPerformanceMessage(attempt.percentage)}</p>

      <div className="result-breakdown">
        <div className="result-stat correct">
          <span>{attempt.correctAnswers}</span> Correct
        </div>
        <div className="result-stat wrong">
          <span>{attempt.wrongAnswers}</span> Wrong
        </div>
        <div className="result-stat unanswered">
          <span>{attempt.unanswered}</span> Unanswered
        </div>
      </div>

      <p className="result-xp">XP Earned: +{xpEarned}</p>

      {newBadges && newBadges.length > 0 && (
        <div className="new-badges">
          <p>New Badges Unlocked:</p>
          {newBadges.map((b) => (
            <span key={b} className="badge-pill">
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="result-actions">
        <Link to={`/quizzes/review/${attempt._id}`} className="btn-secondary">
          Review Answers
        </Link>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResult;