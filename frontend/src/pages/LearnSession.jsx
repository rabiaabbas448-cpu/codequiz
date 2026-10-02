import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const LearnSession = () => {
  const { categoryId, difficulty } = useParams();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(null); // { isCorrect, correctAnswer, explanation }
  const [checking, setChecking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const answersRef = useRef([]); // [{ questionId, selectedOption }]
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    API.post("/learn/start", { categoryId, difficulty })
      .then((res) => {
        setCategoryName(res.data.category.name);
        setQuestions(res.data.questions);
        startTimeRef.current = Date.now();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not start this session.");
      })
      .finally(() => setLoading(false));
  }, [categoryId, difficulty]);

  const question = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const handleCheck = async () => {
    if (selected === null) return;
    setChecking(true);
    setError("");

    try {
      const res = await API.post("/learn/check", {
        questionId: question._id,
        selectedOption: selected,
      });
      setChecked(res.data);
      answersRef.current.push({ questionId: question._id, selectedOption: selected });
    } catch (err) {
      setError("Could not check this answer. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = async () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setChecked(null);
      return;
    }

    setFinishing(true);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await API.post("/learn/finish", {
        categoryId,
        difficulty,
        answers: answersRef.current,
        timeTaken,
      });
      navigate("/learn/result", { state: { ...res.data, categoryName, difficulty } });
    } catch (err) {
      setError("Could not submit this session. Please try again.");
      setFinishing(false);
    }
  };

  if (loading) return <div className="page-loading">Preparing your session...</div>;
  if (error && questions.length === 0) return <div className="error-message">{error}</div>;
  if (!question) return null;

  return (
    <div className="learn-session-page">
      <div className="learn-topbar">
        <span className="learn-topic-pill">{categoryName}</span>
        <span className="learn-level-pill">{difficulty}</span>
      </div>

      <div className="learn-progress-card fade-in">
        <p className="learn-progress-label">PROGRESS</p>
        <p className="learn-progress-count">
          {currentIndex + 1} <span>of {total}</span>
        </p>
        <div className="learn-progress-bar">
          <div
            className="learn-progress-fill"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="learn-question-card fade-in" key={question._id}>
        <p className="learn-question-tag">
          {categoryName} · Q{currentIndex + 1} of {total}
        </p>
        <h2 className="learn-question-text">{question.questionText}</h2>

        <div className="learn-options">
          {question.options.map((option, i) => {
            let cls = "learn-option";
            if (checked) {
              if (i === checked.correctAnswer) cls += " learn-option-correct";
              else if (i === selected) cls += " learn-option-wrong";
            } else if (selected === i) {
              cls += " learn-option-selected";
            }

            return (
              <button
                key={i}
                className={cls}
                disabled={!!checked}
                onClick={() => setSelected(i)}
              >
                <span className="learn-option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            );
          })}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="learn-actions">
          {!checked ? (
            <>
              <span></span>
              <button
                className="btn-primary"
                onClick={handleCheck}
                disabled={selected === null || checking}
              >
                {checking ? "Checking..." : "Check Answer"}
              </button>
            </>
          ) : (
            <>
              <span className={checked.isCorrect ? "learn-result-text correct" : "learn-result-text wrong"}>
                {checked.isCorrect ? "Correct" : `Incorrect — correct answer: ${question.options[checked.correctAnswer]}`}
              </span>
              <button className="btn-primary" onClick={handleContinue} disabled={finishing}>
                {finishing ? "Submitting..." : isLast ? "Finish Session" : "Continue"}
              </button>
            </>
          )}
        </div>
      </div>

      {checked && (
        <div className="learn-explanation-card fade-in">
          <div className="learn-explanation-header">
            <span className="learn-ai-badge">AI</span>
            <div>
              <p className="learn-explanation-title">CodeQuiz AI explanation</p>
              <p className="learn-explanation-subtitle">
                {checked.isCorrect ? "Why this is correct" : "Why this is incorrect"}
              </p>
            </div>
          </div>
          <p className="learn-explanation-text">{checked.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default LearnSession;