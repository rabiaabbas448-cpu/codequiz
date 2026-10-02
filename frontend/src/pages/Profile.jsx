import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

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

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [classLevel, setClassLevel] = useState(user.classLevel || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSaving(true);
      const res = await API.put("/users/profile", { name, classLevel });
      setUser(res.data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const xpForNextLevel = [0, 100, 250, 500, 1000, Infinity];
  const currentLevelFloor = xpForNextLevel[user.level - 1] ?? 0;
  const nextLevelCeiling = xpForNextLevel[user.level] ?? user.xp;
  const xpProgress =
    nextLevelCeiling === Infinity
      ? 100
      : Math.round(((user.xp - currentLevelFloor) / (nextLevelCeiling - currentLevelFloor)) * 100);

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-header-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-header-info">
          <p className="profile-name">{user.name}</p>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-level-badge">Level {user.level}</div>
      </div>

      <div className="profile-stats-row">
        <div className="profile-stat-card">
          <p className="profile-stat-value">{user.xp}</p>
          <p className="profile-stat-label">Total XP</p>
        </div>
        <div className="profile-stat-card">
          <p className="profile-stat-value">{user.badges?.length || 0}</p>
          <p className="profile-stat-label">Badges Earned</p>
        </div>
      </div>

      <div className="profile-xp-section">
        <div className="profile-xp-labels">
          <span>Progress to Level {user.level + 1}</span>
          <span>{xpProgress}%</span>
        </div>
        <div className="xp-progress-bar">
          <div className="xp-progress-fill" style={{ width: `${Math.min(xpProgress, 100)}%` }}></div>
        </div>
      </div>

      {user.badges?.length > 0 && (
        <div className="profile-badges-section">
          <h3>Your Badges</h3>
          <div className="profile-badges-grid">
            {user.badges.map((b) => (
              <span key={b} className="badge-pill">
                🏅 {b}
              </span>
            ))}
          </div>
        </div>
      )}

            <div className="profile-form-card">
        <h3>Edit Profile</h3>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={user.email} disabled />
            </div>

            <div className="form-group">
              <label>Class / Level (optional)</label>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                <option value="">Prefer not to say</option>
                {CLASS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;