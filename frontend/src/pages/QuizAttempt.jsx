import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: optionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startTimeRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    API.get(`/quizzes/${id}/questions`)
      .then((res) => {
        setQuizData(res.data);
        setTimeLeft(res.data.timeLimit * 60);
        startTimeRef.current = Date.now();
      })
      .catch(() => setError("Could not load quiz questions."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answers = quizData.questions.map((q) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] ?? -1,
    }));

    try {
      const res = await API.post("/attempts", { quizId: id, answers, timeTaken });
      navigate(`/quizzes/result/${res.data.attempt._id}`, { state: res.data });
    } catch (err) {
      setError("Failed to submit quiz. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [quizData, selectedAnswers, id, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!quizData || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizData, handleSubmit]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="page-loading">Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!quizData) return null;

  const question = quizData.questions[currentIndex];
  const totalQuestions = quizData.questions.length;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectOption = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [question._id]: optionIndex });
  };

  return (
    <div className="quiz-attempt-page">
      <div className="quiz-header">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className={`timer ${timeLeft < 60 ? "timer-danger" : ""}`}>
          Time Left: {formatTime(timeLeft)}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      <h2 className="question-text">{question.questionText}</h2>

      <div className="options-list">
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selectedAnswers[question._id] === i ? "option-selected" : ""}`}
            onClick={() => selectOption(i)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="quiz-nav">
        <button
          className="btn-secondary"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button className="btn-primary" onClick={() => setCurrentIndex((i) => i + 1)}>
            Next
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>

      <div className="question-jump-list">
        {quizData.questions.map((q, i) => (
          <button
            key={q._id}
            className={`jump-btn ${i === currentIndex ? "jump-active" : ""} ${
              selectedAnswers[q._id] !== undefined ? "jump-answered" : ""
            }`}
            onClick={() => setCurrentIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizAttempt;