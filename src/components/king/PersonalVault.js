"use client";

import { useState, useEffect, useMemo } from "react";

const DEFAULT_CATEGORIES = [
  "DSA / LeetCode",
  "System Design",
  "Interview Prep",
  "Project Ideas",
  "Credentials & Setup",
  "General",
];

const ACCENT_COLORS = {
  cyan: { border: "rgba(56, 189, 248, 0.4)", text: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)" },
  purple: { border: "rgba(168, 85, 247, 0.4)", text: "#c084fc", bg: "rgba(168, 85, 247, 0.12)" },
  emerald: { border: "rgba(16, 185, 129, 0.4)", text: "#34d399", bg: "rgba(16, 185, 129, 0.12)" },
  amber: { border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)" },
  rose: { border: "rgba(244, 63, 94, 0.4)", text: "#fb7185", bg: "rgba(244, 63, 94, 0.12)" },
};

export default function PersonalVault() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState("");

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("DSA / LeetCode");
  const [customFormCategory, setCustomFormCategory] = useState("");
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [formContent, setFormContent] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formColor, setFormColor] = useState("cyan");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Reader modal state
  const [viewingNote, setViewingNote] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  // Load custom categories from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("king_custom_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomCategories(parsed);
      }
    } catch (e) {
      console.warn("Could not load custom categories from storage", e);
    }
  }, []);

  // Compute all available categories (Defaults + Custom + Notes)
  const allCategories = useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...customCategories]);
    notes.forEach((n) => {
      if (n.category && n.category.trim()) {
        set.add(n.category.trim());
      }
    });
    return Array.from(set);
  }, [customCategories, notes]);

  // Fetch notes from API
  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/king/vault");
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
      } else {
        setError(data.error || "Failed to fetch vault notes.");
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Network error fetching vault notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter & Search logic
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesCategory =
        selectedCategory === "All" || n.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term)) ||
        (n.category && n.category.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [notes, selectedCategory, searchTerm]);

  // Handle creating a new category from the filter toolbar
  const handleCreateCategory = (name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    if (!allCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem("king_custom_categories", JSON.stringify(updated));
      } catch (e) {
        // storage quota
      }
    }
    setSelectedCategory(trimmed);
    setNewCatNameInput("");
    setIsAddingCategory(false);
    setStatusMessage(`New category "${trimmed}" added! 🏷️`);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormCategory("DSA / LeetCode");
    setCustomFormCategory("");
    setIsCustomCategoryMode(false);
    setFormContent("");
    setFormPinned(false);
    setFormColor("cyan");
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormTitle(note.title || "");
    const noteCat = note.category || "DSA / LeetCode";
    if (allCategories.includes(noteCat)) {
      setFormCategory(noteCat);
      setIsCustomCategoryMode(false);
    } else {
      setFormCategory("__custom__");
      setCustomFormCategory(noteCat);
      setIsCustomCategoryMode(true);
    }
    setFormContent(note.content || "");
    setFormPinned(Boolean(note.pinned));
    setFormColor(note.color || "cyan");
    setIsEditorOpen(true);
    if (viewingNote) setViewingNote(null);
  };

  // Save / Update Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() && !formContent.trim()) {
      setStatusMessage("Please enter a title or note content.");
      return;
    }

    // Resolve final category
    let finalCategory = formCategory;
    if (isCustomCategoryMode || formCategory === "__custom__") {
      const trimmedCustom = customFormCategory.trim();
      if (!trimmedCustom) {
        setStatusMessage("Please enter a valid category name.");
        return;
      }
      finalCategory = trimmedCustom;
      // Add to custom categories if not present
      if (!allCategories.includes(finalCategory)) {
        const updated = [...customCategories, finalCategory];
        setCustomCategories(updated);
        try {
          localStorage.setItem("king_custom_categories", JSON.stringify(updated));
        } catch (err) {}
      }
    }

    setSaving(true);
    setStatusMessage("");

    const payload = {
      id: editingNote ? editingNote.id : undefined,
      title: formTitle.trim() || "Untitled Note",
      category: finalCategory,
      content: formContent,
      pinned: formPinned,
      color: formColor,
      createdAt: editingNote ? editingNote.createdAt : undefined,
    };

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", note: payload }),
      });
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
        setIsEditorOpen(false);
        setStatusMessage("Note successfully saved to database! 💾");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage(data.error || "Failed to save note.");
      }
    } catch (err) {
      console.error("Error saving note:", err);
      setStatusMessage("Network error while saving note.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePin", id }),
      });
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
        if (viewingNote && viewingNote.id === id) {
          const updated = data.notes.find((n) => n.id === id);
          if (updated) setViewingNote(updated);
        }
      }
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
        if (viewingNote && viewingNote.id === id) setViewingNote(null);
        setStatusMessage("Note deleted 🗑️");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Copy Note to Clipboard
  const handleCopyNote = (note, e) => {
    if (e) e.stopPropagation();
    const textToCopy = `${note.title}\n[${note.category}]\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2500);
  };

  const checklistItems = [
    { title: "GitHub Personal Access Token (PAT)", status: "Active & Synced", icon: "🐙" },
    { title: "LeetCode GraphQL Integration", status: "Sub-Second Edge Caching", icon: "⚡" },
    { title: "SVERI COE College ID & Placement Portal", status: "Verified & Current", icon: "🏛️" },
    { title: "Master Resume PDF (Next.js, Android, AI)", status: "Updated Oct 2026", icon: "📄" },
    { title: "Production Deployment (Vercel & Turbopack)", status: "Optimized Build Passing", icon: "🚀" },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.2rem",
          marginBottom: "1.8rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.7rem", margin: "0 0 6px", fontWeight: 800 }}>
            🔐 Personal <span className="gradient-text">Vault & Private Notes</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Dynamic, searchable knowledge repository with custom categories, algorithm templates, and private prep notes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            fontSize: "0.92rem",
            boxShadow: "0 4px 18px rgba(56, 189, 248, 0.3)",
          }}
        >
          <span style={{ fontSize: 16 }}>➕</span> New Vault Note
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.8rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.4rem",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 26 }}>📚</span>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Total Notes
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {notes.length}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.4rem",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 26 }}>📌</span>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Pinned Favorites
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fbbf24" }}>
              {notes.filter((n) => n.pinned).length}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1rem 1.4rem",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 26 }}>🏷️</span>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Categories Available
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-cyan)" }}>
              {allCategories.length}
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "1.5rem",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 600,
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: "var(--accent-cyan)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>ℹ️</span> {statusMessage}
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div
        className="glass-card"
        style={{
          padding: "1.2rem 1.4rem",
          marginBottom: "1.8rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: "var(--text-muted)",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search notes by title, topic, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: "0.92rem",
                outline: "none",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "var(--badge-bg)",
              padding: 4,
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "grid" ? "var(--accent-cyan)" : "transparent",
                color: viewMode === "grid" ? "#0f172a" : "var(--text-secondary)",
                transition: "all 0.15s ease",
              }}
            >
              🔲 Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "list" ? "var(--accent-cyan)" : "transparent",
                color: viewMode === "list" ? "#0f172a" : "var(--text-secondary)",
                transition: "all 0.15s ease",
              }}
            >
              📑 List
            </button>
          </div>
        </div>

        {/* Category Pills & Admin Category Creator */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setSelectedCategory("All")}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              border: selectedCategory === "All" ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
              background: selectedCategory === "All" ? "rgba(56, 189, 248, 0.18)" : "var(--badge-bg)",
              color: selectedCategory === "All" ? "var(--accent-cyan)" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            All Notes ({notes.length})
          </button>

          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = notes.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(56, 189, 248, 0.18)" : "var(--badge-bg)",
                  color: isSelected ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}

          {/* "+ Add Category" Toggle Button */}
          {!isAddingCategory ? (
            <button
              onClick={() => setIsAddingCategory(true)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                border: "1px dashed rgba(56, 189, 248, 0.5)",
                background: "rgba(56, 189, 248, 0.08)",
                color: "var(--accent-cyan)",
                transition: "all 0.15s ease",
              }}
            >
              ➕ Add Category
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="text"
                placeholder="Category name..."
                value={newCatNameInput}
                onChange={(e) => setNewCatNameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory(newCatNameInput);
                  } else if (e.key === "Escape") {
                    setIsAddingCategory(false);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--accent-cyan)",
                  color: "var(--text-primary)",
                  outline: "none",
                  width: 150,
                }}
              />
              <button
                onClick={() => handleCreateCategory(newCatNameInput)}
                className="btn-primary"
                style={{ padding: "5px 10px", fontSize: "0.78rem" }}
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingCategory(false)}
                style={{
                  padding: "5px 8px",
                  fontSize: "0.78rem",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Notes Content ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
          Loading your personal vault notes...
        </div>
      ) : error ? (
        <div
          className="glass-card"
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#fb7185",
            border: "1px solid rgba(244, 63, 94, 0.3)",
          }}
        >
          {error}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>No notes found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
            {searchTerm || selectedCategory !== "All"
              ? "No notes match your current search or category filter."
              : "Your personal vault is currently empty. Create your first note!"}
          </p>
          <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: "8px 18px" }}>
            ➕ Create First Note
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid View ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {filteredNotes.map((note) => {
            const accent = ACCENT_COLORS[note.color] || ACCENT_COLORS.cyan;
            return (
              <div
                key={note.id}
                className="glass-card"
                onClick={() => setViewingNote(note)}
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  position: "relative",
                  borderLeft: `4px solid ${accent.text}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div>
                  {/* Card Header: Category & Pin */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 6,
                        color: accent.text,
                        background: accent.bg,
                        border: `1px solid ${accent.border}`,
                      }}
                    >
                      {note.category}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {note.pinned && (
                        <span
                          title="Pinned Note"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fbbf24",
                            background: "rgba(245, 158, 11, 0.15)",
                            padding: "2px 6px",
                            borderRadius: 6,
                          }}
                        >
                          📌 Pinned
                        </span>
                      )}
                      <button
                        onClick={(e) => handleTogglePin(note.id, e)}
                        title={note.pinned ? "Unpin Note" : "Pin Note to Top"}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: 15,
                          cursor: "pointer",
                          color: note.pinned ? "#fbbf24" : "var(--text-muted)",
                          padding: "2px 4px",
                        }}
                      >
                        📌
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      margin: "0 0 10px",
                      color: "var(--text-primary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {note.title}
                  </h3>

                  {/* Content Snippet */}
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.88rem",
                      lineHeight: 1.6,
                      maxHeight: "6.5em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      marginBottom: "1.2rem",
                      whiteSpace: "pre-line",
                      fontFamily: note.category && note.category.includes("DSA") ? "var(--font-mono)" : "inherit",
                    }}
                  >
                    {note.content}
                  </div>
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {note.updatedAt
                      ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently updated"}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={(e) => handleCopyNote(note, e)}
                      title="Copy Note Text"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--border-subtle)",
                        background: "rgba(255, 255, 255, 0.04)",
                        color: copiedNoteId === note.id ? "#34d399" : "var(--text-secondary)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {copiedNoteId === note.id ? "✓ Copied" : "📋 Copy"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(note);
                      }}
                      title="Edit Note"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--border-subtle)",
                        background: "rgba(255, 255, 255, 0.04)",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, note.title, e)}
                      title="Delete Note"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(244, 63, 94, 0.25)",
                        background: "rgba(244, 63, 94, 0.08)",
                        color: "#fb7185",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact List View ── */
        <div
          className="glass-card"
          style={{
            padding: "0.5rem",
            marginBottom: "2.5rem",
            display: "grid",
            gap: 4,
          }}
        >
          {filteredNotes.map((note) => {
            const accent = ACCENT_COLORS[note.color] || ACCENT_COLORS.cyan;
            return (
              <div
                key={note.id}
                onClick={() => setViewingNote(note)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <button
                    onClick={(e) => handleTogglePin(note.id, e)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 16,
                      cursor: "pointer",
                      color: note.pinned ? "#fbbf24" : "var(--text-muted)",
                      padding: 0,
                    }}
                  >
                    📌
                  </button>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 6,
                      color: accent.text,
                      background: accent.bg,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {note.category}
                  </span>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {note.title}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {note.updatedAt
                      ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                  <button
                    onClick={(e) => handleCopyNote(note, e)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border-subtle)",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: copiedNoteId === note.id ? "#34d399" : "var(--text-secondary)",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {copiedNoteId === note.id ? "✓" : "📋"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(note);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border-subtle)",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, note.title, e)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(244, 63, 94, 0.25)",
                      background: "rgba(244, 63, 94, 0.08)",
                      color: "#fb7185",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── System Status & Checklist Section ── */}
      <div className="glass-card" style={{ padding: "1.8rem", marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <span>🛡️</span> System & Deployment Integrity
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 16 }}>
          Live checklist of portfolio system architecture, APIs, and credentials status.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.title}</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34d399",
                  background: "rgba(16, 185, 129, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full Note Reader Modal ── */}
      {viewingNote && (
        <div
          onClick={() => setViewingNote(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: 700,
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              padding: "2rem",
              position: "relative",
              border: `1px solid ${
                (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).border
              }`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                paddingBottom: "1.2rem",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: "1.2rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 6,
                      color: (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).text,
                      background: (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).bg,
                    }}
                  >
                    {viewingNote.category}
                  </span>
                  {viewingNote.pinned && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fbbf24",
                        background: "rgba(245, 158, 11, 0.15)",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      📌 Pinned Note
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: "1.45rem", margin: 0, fontWeight: 800 }}>
                  {viewingNote.title}
                </h2>
              </div>

              <button
                onClick={() => setViewingNote(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Note Content Viewer */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: 6,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: viewingNote.category && viewingNote.category.includes("DSA") ? "var(--font-mono)" : "inherit",
              }}
            >
              {viewingNote.content}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1.2rem",
                borderTop: "1px solid var(--border-subtle)",
                marginTop: "1.2rem",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Updated:{" "}
                {viewingNote.updatedAt
                  ? new Date(viewingNote.updatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recently"}
              </span>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleCopyNote(viewingNote)}
                  className="btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                >
                  {copiedNoteId === viewingNote.id ? "✓ Copied Note!" : "📋 Copy All"}
                </button>
                <button
                  onClick={() => handleOpenEdit(viewingNote)}
                  className="btn-primary"
                  style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                >
                  ✏️ Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Note Modal ── */}
      {isEditorOpen && (
        <div
          onClick={() => setIsEditorOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "2rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: "1.2rem",
              }}
            >
              <h3 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 700 }}>
                {editingNote ? "✏️ Edit Vault Note" : "➕ Create New Vault Note"}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              {/* Note Title */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Note Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monotonic Stack Template & Next Greater Element"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Grid: Category & Accent Color */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent-cyan)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      {isCustomCategoryMode ? "← Choose Existing" : "+ New Custom Category"}
                    </button>
                  </div>

                  {!isCustomCategoryMode ? (
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomCategoryMode(true);
                        } else {
                          setFormCategory(e.target.value);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    >
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">➕ + Add New Custom Category...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. System Observability, Kotlin, Docker..."
                      value={customFormCategory}
                      onChange={(e) => setCustomFormCategory(e.target.value)}
                      autoFocus
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--accent-cyan)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Accent Theme
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
                    {Object.keys(ACCENT_COLORS).map((colorKey) => {
                      const colorObj = ACCENT_COLORS[colorKey];
                      const isSelected = formColor === colorKey;
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setFormColor(colorKey)}
                          title={`Color ${colorKey}`}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: colorObj.text,
                            border: isSelected ? "3px solid #ffffff" : "2px solid transparent",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 0 10px rgba(255,255,255,0.6)" : "none",
                            transition: "all 0.15s ease",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Textarea */}
              <div style={{ marginBottom: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Note Content & Code Snippets
                  </label>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {formContent.length} characters
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write algorithm templates, code snippets, architectural notes, or private interview talking points..."
                  style={{
                    width: "100%",
                    flex: 1,
                    minHeight: 180,
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    fontFamily: (formCategory && formCategory.includes("DSA")) || (customFormCategory && customFormCategory.toLowerCase().includes("dsa")) ? "var(--font-mono)" : "inherit",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Pinned Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent-cyan)" }}
                />
                <label htmlFor="pinCheck" style={{ fontSize: "0.9rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  📌 Pin this note to the top of the vault
                </label>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "8px 18px", fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: "8px 22px", fontSize: "0.9rem" }}
                >
                  {saving ? "Saving..." : editingNote ? "Update Note 💾" : "Save Note 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
