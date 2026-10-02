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
  title: "",
  description: "",
  category: "",
  difficulty: "Beginner",
  classLevel: "",
  timeLimit: 10,
  questions: [],
  status: "active",
};

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuizzes = () => {
    API.get("/quizzes")
      .then((res) => setQuizzes(res.data.quizzes))
      .catch(() => setError("Could not load quizzes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    API.get("/categories").then((res) => setCategories(res.data.categories));
    API.get("/questions").then((res) => setAllQuestions(res.data.questions));
    fetchQuizzes();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const toggleQuestion = (id) => {
    setForm((prev) => {
      const exists = prev.questions.includes(id);
      return {
        ...prev,
        questions: exists ? prev.questions.filter((q) => q !== id) : [...prev.questions, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.category || !form.classLevel || !form.timeLimit) {
      setError("Title, category, class level and time limit are required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/quizzes/${editingId}`, form);
      } else {
        await API.post("/quizzes", form);
      }
      resetForm();
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async (quiz) => {
    // fetch full quiz (list view strips the questions array)
    const res = await API.get(`/quizzes/${quiz._id}`);
    setEditingId(quiz._id);
    setForm({
      title: quiz.title,
      description: quiz.description || "",
      category: quiz.category?._id || quiz.category,
      difficulty: quiz.difficulty,
      classLevel: quiz.classLevel,
      timeLimit: quiz.timeLimit,
      questions: [], // admin can re-select questions when editing
      status: quiz.status || "active",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await API.delete(`/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      setError("Could not delete quiz.");
    }
  };

  const filteredQuestions = form.category
    ? allQuestions.filter((q) => (q.category?._id || q.category) === form.category)
    : allQuestions;

  return (
    <div className="manage-page">
      <h1>Manage Quizzes</h1>

      {error && <div className="error-message">{error}</div>}

      <form className="quiz-form" onSubmit={handleSubmit}>
        <input
          placeholder="Quiz title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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

          <input
            type="number"
            min="1"
            placeholder="Time limit (min)"
            value={form.timeLimit}
            onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
          />

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <p>Select Questions ({form.questions.length} selected):</p>
        <div className="question-picker">
          {filteredQuestions.map((q) => (
            <label key={q._id} className="question-picker-item">
              <input
                type="checkbox"
                checked={form.questions.includes(q._id)}
                onChange={() => toggleQuestion(q._id)}
              />
              {q.questionText}
            </label>
          ))}
        </div>

        <button type="submit" className="btn-primary">
          {editingId ? "Update Quiz" : "Create Quiz"}
        </button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="page-loading">Loading quizzes...</div>
      ) : (
        <table className="manage-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q._id}>
                <td>{q.title}</td>
                <td>{q.category?.name}</td>
                <td>{q.difficulty}</td>
                <td>{q.questionCount}</td>
                <td>{q.status}</td>
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

export default ManageQuizzes;