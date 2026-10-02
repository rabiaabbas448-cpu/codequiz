import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

const QuizReview = () => {
  const { id } = useParams(); // attempt id
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/attempts/${id}`)
      .then((res) => setAttempt(res.data.attempt))
      .catch(() => setError("Could not load review."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading review...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="quiz-review-page">
      <h1>Review Answers</h1>
      <p className="review-quiz-title">{attempt.quiz?.title}</p>

      {attempt.answers.map((ans, i) => {
        const question = ans.question;
        return (
          <div
            key={question._id}
            className={`review-question-card ${ans.isCorrect ? "review-correct" : "review-wrong"}`}
          >
            <p className="review-question-number">Question {i + 1}</p>
            <p className="review-question-text">{question.questionText}</p>

            <div className="review-options">
              {question.options.map((option, optIndex) => {
                let optionClass = "review-option";
                if (optIndex === question.correctAnswer) optionClass += " correct-answer";
                if (optIndex === ans.selectedOption && optIndex !== question.correctAnswer)
                  optionClass += " wrong-answer";

                return (
                  <div key={optIndex} className={optionClass}>
                    {option}
                    {optIndex === question.correctAnswer && " ✓"}
                    {optIndex === ans.selectedOption && optIndex !== question.correctAnswer && " ✗"}
                  </div>
                );
              })}
            </div>

            {ans.selectedOption === -1 && <p className="review-unanswered-tag">Not Answered</p>}

            {question.explanation && (
              <p className="review-explanation">Explanation: {question.explanation}</p>
            )}
          </div>
        );
      })}

      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default QuizReview;