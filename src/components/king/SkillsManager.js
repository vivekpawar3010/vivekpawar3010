"use client";

import { useState, useEffect } from "react";

export default function SkillsManager() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Programming Languages");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [badge, setBadge] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadSkills = async () => {
    try {
      const res = await fetch("/api/king/skills");
      const data = await res.json();
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      console.error("Error loading skills", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/king/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          category,
          name: name.trim(),
          level,
          badge: badge.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        setName("");
        setBadge("");
        setFeedback(`Added skill "${name}"`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error("Error adding skill", err);
    }
  };

  const handleDeleteSkill = async (catName, skillName) => {
    if (!confirm(`Delete skill "${skillName}" from ${catName}?`)) return;

    try {
      const res = await fetch("/api/king/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          category: catName,
          name: skillName,
        }),
      });
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        setFeedback(`Deleted "${skillName}"`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting skill", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
          ⚡ Skills <span className="gradient-text">Manager</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
          Manage your technical stack, proficiency levels, and highlight badges across categories.
        </p>
      </div>

      {feedback && (
        <div style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: 600, marginBottom: "1.2rem", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          ✓ {feedback}
        </div>
      )}

      {/* Add Skill Form */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", margin: "0 0 12px" }}>➕ Add New Skill</h3>
        <form onSubmit={handleAddSkill} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", background: "#1e293b", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
            >
              <option value="Programming Languages">Programming Languages</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend & APIs">Backend & APIs</option>
              <option value="Mobile & Android">Mobile & Android</option>
              <option value="Databases & Tools">Databases & Tools</option>
              <option value="DSA & Core CS">DSA & Core CS</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Skill Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, GraphQL, Redis"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Proficiency Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", background: "#1e293b", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
            >
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Strong">Strong</option>
              <option value="Learning">Learning</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Optional Badge
            </label>
            <input
              type="text"
              placeholder="Primary, LeetCode, Active"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: "9px 18px", fontSize: "0.9rem", height: 38 }}>
            Add Skill
          </button>
        </form>
      </div>

      {/* Skills Categories Display */}
      {loading ? (
        <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading skills...</div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {skills.map((group, idx) => (
            <div key={idx} className="glass-card" style={{ padding: "1.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{group.icon || "💡"}</span>
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>{group.category}</h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({group.items.length})</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: "0.88rem",
                      color: "#f1f5f9",
                    }}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 6,
                          background: item.badge === "Primary" ? "rgba(56,189,248,0.2)" : "rgba(16,185,129,0.2)",
                          color: item.badge === "Primary" ? "#38bdf8" : "#34d399",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSkill(group.category, item.name)}
                      style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 11, padding: 0 }}
                      title="Delete skill"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
