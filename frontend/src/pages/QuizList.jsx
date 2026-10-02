import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";

const QuizList = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;

        const res = await API.get("/quizzes", { params });
        setQuizzes(res.data.quizzes);
      } catch (err) {
        setError("Could not load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty]);

  return (
    <div className="quiz-list-page">
      <h1>Browse Quizzes</h1>

      <div className="filters">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading && <div className="page-loading">Loading quizzes...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && quizzes.length === 0 && <p>No quizzes found for this filter.</p>}

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-card">
            <h3>{quiz.title}</h3>
            <p className="quiz-meta">
              {quiz.category?.name} • {quiz.difficulty}
            </p>
            <p className="quiz-meta">
              {quiz.questionCount} Questions • {quiz.timeLimit} min
            </p>
            <Link to={`/quizzes/${quiz._id}`} className="btn-primary">
              Start Quiz
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;