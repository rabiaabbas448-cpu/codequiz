import { useEffect, useState } from "react";
import API from "../api/axios";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const GenerateQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(null); // "categoryId-difficulty"
  const [message, setMessage] = useState("");

  const fetchCounts = () => {
    API.get("/ai/counts")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Could not load question counts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleGenerate = async (categoryId, difficulty) => {
    const key = `${categoryId}-${difficulty}`;
    setGenerating(key);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/ai/generate", { categoryId, difficulty, count: 10 });
      setMessage(`Added ${res.data.created} new questions.`);
      fetchCounts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate questions. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="manage-page">
      <h1>Generate AI Questions</h1>
      <p className="topics-subtitle">
        Pick a category and level — AI will automatically write 10 quiz questions for it.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <table className="manage-table">
        <thead>
          <tr>
            <th>Category</th>
            {LEVELS.map((level) => (
              <th key={level}>{level}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              {LEVELS.map((level) => {
                const key = `${cat._id}-${level}`;
                const count = cat.counts[level];
                return (
                  <td key={level}>
                    <div className="generate-cell">
                      <span className={count > 0 ? "generate-count-ok" : "generate-count-empty"}>
                        {count} questions
                      </span>
                      <button
                        className="btn-link"
                        onClick={() => handleGenerate(cat._id, level)}
                        disabled={generating === key}
                      >
                        {generating === key ? "Generating..." : "Generate 10"}
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenerateQuestions;