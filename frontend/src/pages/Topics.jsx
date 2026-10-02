import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/learn/topics")
      .then((res) => setTopics(res.data.topics))
      .catch(() => setError("Could not load topics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading topics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="topics-page">
      <h1>Choose a Language</h1>
      <p className="topics-subtitle">Complete each level with 70% or higher to unlock the next one.</p>

      <input
        className="search-input"
        placeholder="Search languages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="topics-grid">
        {filteredTopics.map((topic) => (
          <div key={topic._id} className="topic-card">
            <h3>{topic.name}</h3>

            <div className="level-list">
              {LEVELS.map((level) => {
                const isUnlocked = topic.unlockedLevels.includes(level);
                const bestScore = topic.bestScores[level];

                return isUnlocked ? (
                  <Link
                    key={level}
                    to={`/learn/${topic._id}/${level}`}
                    className="level-pill level-unlocked"
                  >
                    <span>{level}</span>
                    <span className="level-score">{bestScore > 0 ? `${bestScore}%` : "Start"}</span>
                  </Link>
                ) : (
                  <div key={level} className="level-pill level-locked">
                    <span>🔒 {level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topics;