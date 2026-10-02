import { useEffect, useState } from "react";
import API from "../api/axios";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = () => {
    API.get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Could not load categories."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setOrder("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, { name, description, order });
      } else {
        await API.post("/categories", { name, description, order });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
    setOrder(cat.order ?? "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete category.");
    }
  };

  if (loading) return <div className="page-loading">Loading categories...</div>;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-page">
      <h1>Manage Categories</h1>

      {error && <div className="error-message">{error}</div>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Order (1, 2, 3...)"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ maxWidth: "140px" }}
        />
        <button type="submit" className="btn-primary">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <input
        className="search-input"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="manage-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.order}</td>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <button className="btn-link" onClick={() => handleEdit(cat)}>
                  Edit
                </button>
                <button className="btn-link btn-danger" onClick={() => handleDelete(cat._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCategories;