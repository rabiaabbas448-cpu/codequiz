import { useEffect, useState } from "react";
import API from "../api/axios";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Beginner / Self Learner",
];

const emptyForm = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
  category: "",
  difficulty: "Beginner",
  classLevel: "",
};

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestions = () => {
    API.get("/questions", { params: search ? { search } : {} })
      .then((res) => setQuestions(res.data.questions))
      .catch(() => setError("Could not load questions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    API.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.questionText || form.options.some((o) => !o) || !form.category || !form.classLevel) {
      setError("All fields are required, including 4 options");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/questions/${editingId}`, form);
      } else {
        await API.post("/questions", form);
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setForm({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      category: q.category?._id || q.category,
      difficulty: q.difficulty,
      classLevel: q.classLevel,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await API.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      setError("Could not delete question.");
    }
  };

  return (
    <div className="manage-page">
      <h1>Manage Questions</h1>

      {error && <div className="error-message">{error}</div>}

      <form className="question-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Question text"
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
        />

        {form.options.map((opt, i) => (
          <div key={i} className="option-input-row">
            <input
              type="radio"
              name="correctAnswer"
              checked={form.correctAnswer === i}
              onChange={() => setForm({ ...form, correctAnswer: i })}
            />
            <input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
            />
          </div>
        ))}

        <textarea
          placeholder="Explanation (optional)"
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
        />

        <div className="form-row">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={form.classLevel}
            onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
          >
            <option value="">Select Class</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary">
          {editingId ? "Update Question" : "Add Question"}
        </button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <input
        className="search-input"
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="page-loading">Loading questions...</div>
      ) : (
        <table className="manage-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q._id}>
                <td>{q.questionText}</td>
                <td>{q.category?.name}</td>
                <td>{q.difficulty}</td>
                <td>
                  <button className="btn-link" onClick={() => handleEdit(q)}>
                    Edit
                  </button>
                  <button className="btn-link btn-danger" onClick={() => handleDelete(q._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageQuestions;