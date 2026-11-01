"use client";

import { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  FolderPlus,
  CheckCircle2,
  Tag,
  Link2,
} from "lucide-react";
import { GithubIcon as Github } from "../BrandIcons";

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
  const [categories, setCategories] = useState(["All", "Full Stack", "Mobile App", "AI & ML", "Systems & Cloud"]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/king/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
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
    setForm({
      ...emptyProject,
      category: categories.find((c) => c !== "All") || "Full Stack",
    });
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
        setFeedback(editingId ? "Project updated successfully!" : "New project added successfully!");
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
      const res = await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: proj.id || proj.name,
          project: { ...proj, featured: updated },
        }),
      });
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (err) {
      console.error("Error toggling featured", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_category", category: trimmed }),
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setNewCatName("");
        setShowCategoryModal(false);
        setFeedback(`Category "${trimmed}" added!`);
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error adding category", err);
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (catName === "All") return;
    if (!confirm(`Delete project category "${catName}"?`)) return;

    try {
      const res = await fetch("/api/king/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_category", category: catName }),
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setFeedback(`Category "${catName}" deleted.`);
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error deleting category", err);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="section-tag">
            <FolderGit2 size={13} style={{ marginRight: 4 }} /> Production Work
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Projects <span className="lime-underline">Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Add, update, or feature production portfolio projects. Manage dynamic categories for the public filter bar.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowCategoryModal(!showCategoryModal)}
            className="btn-dark-pill"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px" }}
          >
            <Tag size={15} /> Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-lime"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px" }}
          >
            <Plus size={16} /> New Project
          </button>
        </div>
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

      {/* Dynamic Category Management Drawer */}
      {showCategoryModal && (
        <div className="glass-card" style={{ padding: "1.4rem", borderRadius: 14, marginBottom: "2rem", border: "1.5px dashed var(--accent-brand)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 10px", color: "var(--text-primary)" }}>
            Manage Public Project Categories
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
            {categories.map((cat, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 9999,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {cat}
                {cat !== "All" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", padding: 0 }}
                    title="Delete category"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 10, maxWidth: 450 }}>
            <input
              type="text"
              placeholder="New category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.85rem",
              }}
            />
            <button type="submit" className="btn-lime" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Add Category
            </button>
          </form>
        </div>
      )}

      {/* Add / Edit Project Modal/Card */}
      {showForm && (
        <form onSubmit={handleSave} className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              {editingId ? `Edit Project: ${form.name}` : "Create New Project"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gap: "1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StudyBuddy AI"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Subtitle / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Architect & Creator"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
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

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Description (1–2 concise punchy sentences)
              </label>
              <textarea
                rows={3}
                placeholder="What problem does it solve and what impact did it make?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Tech Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Next.js, Tailwind, FastAPI"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
                  Live App URL
                </label>
                <input
                  type="url"
                  placeholder="https://studybuddy.ai"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
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
                  GitHub Repo URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  style={{ accentColor: "var(--accent-brand)", width: 16, height: 16 }}
                />
                Feature in Home Page Showcase
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-dark-pill"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                  {editingId ? "Update Project" : "Add Project"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Projects List Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>Loading projects...</div>
      ) : (
        <div style={{ display: "grid", gap: "1.2rem" }}>
          {projects.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="glass-card"
              style={{
                padding: "1.4rem",
                borderRadius: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {proj.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      background: "var(--badge-bg)",
                      color: "var(--accent-brand)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {proj.category || "Full Stack"}
                  </span>
                  {proj.featured && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 9999,
                        background: "rgba(234, 88, 12, 0.15)",
                        color: "var(--accent-brand)",
                        border: "1px solid var(--border-subtle)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Star size={11} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                <p style={{ margin: "4px 0 8px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {proj.description}
                </p>

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "12px", color: "var(--accent-brand)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <ExternalLink size={12} /> Live App
                    </a>
                  )}
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <Github size={12} /> Source Code
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => toggleFeatured(proj)}
                  title={proj.featured ? "Unfeature" : "Mark as Featured"}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    background: proj.featured ? "var(--badge-bg)" : "transparent",
                    border: "1px solid var(--border-subtle)",
                    color: proj.featured ? "var(--accent-brand)" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <Star size={13} fill={proj.featured ? "currentColor" : "none"} />
                  {proj.featured ? "Featured" : "Feature"}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(proj)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(proj.id || proj.name, proj.name)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#f43f5e",
                    cursor: "pointer",
                  }}
                  title="Delete project"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
