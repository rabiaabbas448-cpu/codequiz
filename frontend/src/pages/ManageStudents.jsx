import { useEffect, useState } from "react";
import API from "../api/axios";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAttempts, setSelectedAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = () => {
    API.get("/users")
      .then((res) => setStudents(res.data.students))
      .catch(() => setError("Could not load students."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const viewStudent = async (id) => {
    const res = await API.get(`/users/${id}`);
    setSelectedStudent(res.data.student);
    setSelectedAttempts(res.data.attempts);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student account? This cannot be undone.")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchStudents();
      if (selectedStudent?._id === id) setSelectedStudent(null);
    } catch (err) {
      setError("Could not delete student.");
    }
  };

  if (loading) return <div className="page-loading">Loading students...</div>;

  return (
    <div className="manage-page">
      <h1>Manage Students</h1>

      {error && <div className="error-message">{error}</div>}

      <table className="manage-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Class</th>
            <th>XP</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.classLevel}</td>
              <td>{s.xp}</td>
              <td>{s.level}</td>
              <td>
                <button className="btn-link" onClick={() => viewStudent(s._id)}>
                  View
                </button>
                <button className="btn-link btn-danger" onClick={() => handleDelete(s._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedStudent && (
        <div className="student-detail-panel">
          <h2>{selectedStudent.name}'s Performance</h2>
          <p>Total Attempts: {selectedAttempts.length}</p>
          {selectedAttempts.length === 0 ? (
            <p>No quiz attempts yet.</p>
          ) : (
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedAttempts.map((a) => (
                  <tr key={a._id}>
                    <td>{a.score}</td>
                    <td>{a.percentage}%</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;