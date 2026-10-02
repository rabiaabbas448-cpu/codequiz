import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const LearnResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [openIndex, setOpenIndex] = useState(null);

  if (!data) {
    return (
      <div className="learn-session-page">
        <div className="error-message">No result data found.</div>
        <Link to="/topics" className="btn-primary">
          Back to Topics
        </Link>
      </div>
    );
  }

  const {
    score,
    total,
    percentage,
    correctAnswers,
    wrongAnswers,
    unanswered,
    xpEarned,
    passed,
    passPercent,
    unlockedNext,
    newBadges,
    review,
    categoryName,
    difficulty,
  } = data;

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="learn-session-page">
      <div className="learn-topbar">
        <span className="learn-topic-pill">{categoryName}</span>
        <span className="learn-level-pill">{difficulty}</span>
      </div>

      <p className="learn-session-complete">SESSION COMPLETE</p>

      <div className="learn-summary-card fade-in">
        <div className="learn-summary-left">
          <p className="learn-summary-label">{categoryName}</p>
          <p className="learn-summary-score">
            {score}<span>/{total}</span>
          </p>
          <p className="learn-summary-accuracy">{percentage}% accuracy</p>
        </div>

        <div className="learn-summary-mid">
          <div>
            <p className="learn-stat-label correct">CORRECT</p>
            <p className="learn-stat-value">{correctAnswers}</p>
          </div>
          <div>
            <p className="learn-stat-label missed">MISSED</p>
            <p className="learn-stat-value">{wrongAnswers + unanswered}</p>
          </div>
        </div>

        <div className="learn-summary-actions">
          <button className="btn-primary" onClick={() => navigate(0)}>
            Retry Quiz
          </button>
          <Link to="/topics" className="btn-secondary">
            New Topic
          </Link>
        </div>
      </div>

      <p className="learn-xp-line">+{xpEarned} XP earned</p>

      {passed && (
        <div className="success-message">
          You passed this level (need {passPercent}%+).
          {unlockedNext && ` "${unlockedNext}" level is now unlocked!`}
        </div>
      )}
      {!passed && (
        <div className="error-message">
          You need {passPercent}% to unlock the next level — you scored {percentage}%. Try again!
        </div>
      )}

      {newBadges && newBadges.length > 0 && (
        <div className="new-badges">
          {newBadges.map((b) => (
            <span key={b} className="badge-pill">
              {b}
            </span>
          ))}
        </div>
      )}

      {review.map((r, i) => (
        <div
          key={r.questionId}
          className={`learn-review-card fade-in ${r.isCorrect ? "review-correct" : "review-wrong"}`}
        >
          <div className="learn-review-top">
            <span className="learn-review-qnum">Q{i + 1}</span>
            <p className="learn-review-text">{r.questionText}</p>
            <span className={`learn-review-badge ${r.isCorrect ? "badge-correct" : "badge-incorrect"}`}>
              {r.isCorrect ? "CORRECT" : "INCORRECT"}
            </span>
          </div>

          <p className="learn-review-answer">
            Your answer: {r.selectedOption === -1 ? "Not answered" : r.options[r.selectedOption]}
          </p>
          {!r.isCorrect && (
            <p className="learn-review-correct-answer">Correct: {r.options[r.correctAnswer]}</p>
          )}

          {r.explanation && (
            <button className="learn-explanation-toggle" onClick={() => toggle(i)}>
              AI EXPLANATION · {openIndex === i ? "TAP TO COLLAPSE" : "TAP TO EXPAND"}
            </button>
          )}

          {openIndex === i && r.explanation && (
            <p className="learn-review-explanation fade-in">{r.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default LearnResult;