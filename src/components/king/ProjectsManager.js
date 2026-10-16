"use client";

import { useState, useEffect } from "react";

const emptyProject = {
  name: "",
  subtitle: "",
  description: "",
  category: "Full Stack",
  tags: "React, Next.js, Node.js",
  link: "",
  github: "",
  featured: false,
};

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/king/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (err) {
      console.error("Error loading projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyProject);
    setShowForm(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingId(proj.id || proj.name);
    setForm({
      name: proj.name,
      subtitle: proj.subtitle || "",
      description: proj.description || "",
      category: proj.category || "Full Stack",
      tags: Array.isArray(proj.tags) ? proj.tags.join(", ") : proj.tags || "",
      link: proj.link || "",
      github: proj.github || "",
      featured: Boolean(proj.featured),
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const action = editingId ? "update" : "add";
    const payload = {
      action,
      id: editingId,
      project: form,
    };

    try {
      const res = await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
        setShowForm(false);
        setEditingId(null);
        setFeedback(editingId ? "Project updated!" : "New project added!");
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error saving project", err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;

    try {
      const res = await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
        setFeedback(`Deleted "${name}"`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting project", err);
    }
  };

  const toggleFeatured = async (proj) => {
    const updated = !proj.featured;
    try {
      await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: proj.id || proj.name,
          project: { ...proj, featured: updated },
        }),
      });
      setProjects((prev) =>
        prev.map((p) =>
          (p.id === proj.id || p.name === proj.name) ? { ...p, featured: updated } : p
        )
      );
    } catch (err) {
      console.error("Error toggling featured", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            💼 Projects <span className="gradient-text">Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Add, update, or remove portfolio projects with live tags and featured status.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ fontSize: "0.9rem", padding: "8px 16px" }}>
          ➕ Add New Project
        </button>
      </div>

      {feedback && (
        <div style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: 600, marginBottom: "1.2rem", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          ✓ {feedback}
        </div>
      )}

      {/* Add / Edit Form Modal/Drawer */}
      {showForm && (
        <div className="glass-card" style={{ padding: "1.8rem", marginBottom: "2rem", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
          <h3 style={{ fontSize: "1.2rem", margin: "0 0 14px" }}>
            {editingId ? "✏️ Edit Project" : "➕ Create New Project"}
          </h3>

          <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StudyBuddy AI"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Subtitle / One-liner
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Doubt Resolution"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Detailed description of features and architecture..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "#1e293b", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="AI & Web">AI & Web</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Android">Android</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Technologies / Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Next.js, Node.js"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  Live Link / URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  GitHub Repo Link
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "#fff" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                id="featCheck"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="featCheck" style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Feature on Homepage Work Showcase
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ fontSize: "0.88rem" }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ fontSize: "0.88rem" }}>
                {editingId ? "Update Project" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading projects...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((proj) => {
            const id = proj.id || proj.name;
            return (
              <div
                key={id}
                className="glass-card"
                style={{
                  padding: "1.2rem 1.4rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-cyan)", background: "rgba(56,189,248,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                      {proj.category}
                    </span>
                    <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>{proj.name}</h3>
                    {proj.featured && (
                      <span style={{ fontSize: 11, color: "#fbbf24", background: "rgba(245,158,11,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "4px 0 8px", lineHeight: 1.5 }}>
                    {proj.description}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(Array.isArray(proj.tags) ? proj.tags : (proj.tags || "").split(",")).map((t, idx) => (
                      <span key={idx} style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4, color: "#94a3b8" }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => toggleFeatured(proj)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid var(--border-subtle)",
                      background: proj.featured ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                      color: proj.featured ? "#fbbf24" : "#94a3b8",
                    }}
                  >
                    {proj.featured ? "★ Unfeature" : "☆ Feature"}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(id, proj.name)}
                    style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#fb7185", padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
