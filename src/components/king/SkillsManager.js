"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Trash2,
  FolderPlus,
  Percent,
  Award,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function SkillsManager() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Programming Languages");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [percentage, setPercentage] = useState(85);
  const [badge, setBadge] = useState("");
  const [feedback, setFeedback] = useState("");

  // Category management modal / inline
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⚡");

  const loadSkills = async () => {
    try {
      const res = await fetch("/api/king/skills");
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        if (data.skills.length > 0 && !category) {
          setCategory(data.skills[0].category);
        }
      }
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
          percentage: Number(percentage) || 85,
          badge: badge.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        setName("");
        setBadge("");
        setPercentage(85);
        setFeedback(`Skill "${name}" added with ${percentage}% proficiency!`);
        setTimeout(() => setFeedback(""), 3500);
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/king/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_category",
          category: trimmed,
          icon: newCatIcon || "⚡",
        }),
      });
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        setCategory(trimmed);
        setNewCatName("");
        setShowNewCategory(false);
        setFeedback(`Category "${trimmed}" created!`);
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!confirm(`Delete entire category "${catName}" and all its skills?`)) return;

    try {
      const res = await fetch("/api/king/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_category",
          category: catName,
        }),
      });
      const data = await res.json();
      if (data.skills) {
        setSkills(data.skills);
        if (data.skills.length > 0) setCategory(data.skills[0].category);
        setFeedback(`Category "${catName}" deleted.`);
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="section-tag">
            <Zap size={13} style={{ marginRight: 4 }} /> Skills Engine
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Skills &amp; Tech Stack <span className="lime-underline">Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Add technical stack items, adjust 0–100% proficiency gauges, highlight badges, and manage categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewCategory(!showNewCategory)}
          className="btn-dark-pill"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px" }}
        >
          <FolderPlus size={15} />
          {showNewCategory ? "Cancel Category" : "New Skill Category"}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            fontWeight: 700,
            marginBottom: "1.5rem",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {feedback}
        </div>
      )}

      {/* Add New Category Panel */}
      {showNewCategory && (
        <form
          onSubmit={handleAddCategory}
          className="glass-card"
          style={{
            padding: "1.5rem",
            borderRadius: 14,
            marginBottom: "2rem",
            border: "1.5px dashed var(--accent-brand)",
            background: "var(--badge-bg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FolderPlus size={18} style={{ color: "var(--accent-brand)" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Create New Skills Category
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI / LLM Tooling, DevOps & Cloud"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Icon / Symbol
              </label>
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                style={{
                  width: 80,
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  textAlign: "center",
                }}
              />
            </div>
            <button type="submit" className="btn-lime" style={{ padding: "9px 18px", height: 40 }}>
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Add Skill Form */}
      <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.2rem" }}>
          <Plus size={18} style={{ color: "var(--accent-brand)" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Add Skill to Category
          </h3>
        </div>

        <form onSubmit={handleAddSkill} style={{ display: "grid", gap: "1.2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Target Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              >
                {skills.map((s, idx) => (
                  <option key={idx} value={s.category}>
                    {s.icon || "⚡"} {s.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Skill Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Next.js 16, Redis, Spring Boot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Proficiency Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              >
                <option value="Advanced">Advanced (85-95%)</option>
                <option value="Strong">Strong (75-85%)</option>
                <option value="Intermediate">Intermediate (60-75%)</option>
                <option value="Learning">Learning (40-60%)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Highlight Badge (Optional)
              </label>
              <input
                type="text"
                placeholder="Primary, Production, Certified"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* 0-100% Slider & Number Gauge */}
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Percent size={14} style={{ color: "var(--accent-brand)" }} /> Granular Proficiency Gauge:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                  style={{
                    width: 64,
                    padding: "4px 8px",
                    textAlign: "center",
                    fontWeight: 800,
                    borderRadius: 6,
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-brand)",
                  }}
                />
                <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>%</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-brand)", cursor: "pointer" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-lime" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px" }}>
              <Plus size={16} /> Add Skill to {category}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Categories Display */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>Loading skills...</div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {skills.map((group, idx) => (
            <div key={idx} className="glass-card" style={{ padding: "1.6rem", borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{group.icon || "⚡"}</span>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                    {group.category}
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                    ({Array.isArray(group.items) ? group.items.length : 0} items)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCategory(group.category)}
                  title={`Delete category "${group.category}"`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#f43f5e",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Trash2 size={13} /> Delete Category
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {Array.isArray(group.items) &&
                  group.items.map((item, itemIdx) => {
                    const itemPct = item.percentage || (item.level === "Advanced" ? 90 : item.level === "Strong" ? 80 : 70);
                    return (
                      <div
                        key={itemIdx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem" }}>
                            {item.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSkill(group.category, item.name)}
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 2 }}
                            title="Delete skill"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-secondary)" }}>
                          <span>{item.level || "Proficient"}</span>
                          {item.badge && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 4,
                                background: "var(--badge-bg)",
                                color: "var(--accent-brand)",
                                border: "1px solid var(--border-subtle)",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          <span style={{ fontWeight: 800, color: "var(--accent-brand)" }}>{itemPct}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: "100%", height: 5, borderRadius: 9999, background: "var(--input-bg)", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${itemPct}%`,
                              height: "100%",
                              borderRadius: 9999,
                              background: "linear-gradient(90deg, var(--accent-brand) 0%, var(--accent-secondary) 100%)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
