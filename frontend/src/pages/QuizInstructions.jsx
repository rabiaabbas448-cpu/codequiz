import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/quizzes/${id}`)
      .then((res) => setQuiz(res.data.quiz))
      .catch(() => setError("Quiz not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="quiz-instructions-page">
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>

      <div className="instructions-meta">
        <p>Category: {quiz.category?.name}</p>
        <p>Difficulty: {quiz.difficulty}</p>
        <p>Questions: {quiz.questionCount}</p>
        <p>Time Limit: {quiz.timeLimit} minutes</p>
      </div>

      <ul className="instructions-list">
        <li>Once started, the timer cannot be paused.</li>
        <li>The quiz will auto-submit when the timer reaches zero.</li>
        <li>You can navigate between questions before submitting.</li>
        <li>Unanswered questions are marked as incorrect.</li>
      </ul>

      <button className="btn-primary" onClick={() => navigate(`/quizzes/${id}/attempt`)}>
        Start Quiz
      </button>
    </div>
  );
};

export default QuizInstructions;