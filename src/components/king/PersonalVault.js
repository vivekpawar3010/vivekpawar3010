"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const DEFAULT_CATEGORIES = [];

const ACCENT_COLORS = {
  cyan: { border: "rgba(56, 189, 248, 0.4)", text: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", icon: "📁" },
  purple: { border: "rgba(168, 85, 247, 0.4)", text: "#c084fc", bg: "rgba(168, 85, 247, 0.12)", icon: "📂" },
  emerald: { border: "rgba(16, 185, 129, 0.4)", text: "#34d399", bg: "rgba(16, 185, 129, 0.12)", icon: "📁" },
  amber: { border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)", icon: "📂" },
  rose: { border: "rgba(244, 63, 94, 0.4)", text: "#fb7185", bg: "rgba(244, 63, 94, 0.12)", icon: "📁" },
};

export default function PersonalVault() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Navigation mode: 'folder_explorer' | 'flat_notes'
  const [navMode, setNavMode] = useState("folder_explorer");
  const [activeFolder, setActiveFolder] = useState(null); // null = all folders, or string folder name

  // Search & View options
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Folder creation & rename modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("cyan");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formColor, setFormColor] = useState("cyan");
  const [saving, setSaving] = useState(false);

  // Move note modal / quick state
  const [movingNoteId, setMovingNoteId] = useState(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState("");

  // Reader modal state
  const [viewingNote, setViewingNote] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  // Fetch notes and folders from API
  const fetchVaultData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/king/vault");
      const data = await res.json();
      if (res.ok) {
        if (data.notes) setNotes(data.notes);
        if (data.folders) setFolders(data.folders);
      } else {
        setError(data.error || "Failed to fetch vault notes and folders.");
      }
    } catch (err) {
      console.error("Error fetching vault data:", err);
      setError("Network error fetching vault data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Compute all available categories strictly from existing user folders (never synthesize demo/phantom folders)
  const allCategoryNames = useMemo(() => {
    return folders.map((f) => (f.name || "").trim()).filter(Boolean);
  }, [folders]);

  // Filter notes by search and active category / folder
  const displayedNotes = useMemo(() => {
    return notes.filter((n) => {
      // If we are drilled into a specific folder:
      if (activeFolder) {
        if ((n.category || "").toLowerCase() !== activeFolder.toLowerCase()) {
          return false;
        }
      } else if (navMode === "flat_notes" && selectedCategory !== "All") {
        if ((n.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search matching
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term)) ||
        (n.category && n.category.toLowerCase().includes(term))
      );
    });
  }, [notes, activeFolder, navMode, selectedCategory, searchTerm]);

  // Compute folder cards with accurate real-time stats (no phantom/demo folders)
  const computedFolderCards = useMemo(() => {
    const map = new Map();

    // Seed strictly from user folders API
    folders.forEach((f) => {
      const key = f.name.toLowerCase().trim();
      map.set(key, {
        id: f.id,
        name: f.name.trim(),
        color: f.color || "cyan",
        description: f.description || `Notes saved in ${f.name}`,
        noteCount: 0,
        pinnedCount: 0,
        recentTitle: null,
      });
    });

    // Map notes only to existing folders; never synthesize phantom demo folders
    notes.forEach((n) => {
      const cat = (n.category || "").trim();
      if (!cat) return;
      const key = cat.toLowerCase();
      if (map.has(key)) {
        const item = map.get(key);
        item.noteCount += 1;
        if (n.pinned) item.pinnedCount += 1;
        if (!item.recentTitle) item.recentTitle = n.title;
      }
    });

    return Array.from(map.values());
  }, [folders, notes]);

  // ── Folder Actions ───────────────────────────────────────────────────────────
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_folder",
          folderName: trimmed,
          color: newFolderColor,
          description: newFolderDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.folders) setFolders(data.folders);
        if (data.notes) setNotes(data.notes);
        setIsFolderModalOpen(false);
        setNewFolderName("");
        setNewFolderDesc("");
        setStatusMessage(`📁 Folder "${trimmed}" created successfully!`);
        setTimeout(() => setStatusMessage(""), 3500);
      } else {
        alert(data.error || "Failed to create folder.");
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Network error creating folder.");
    }
  };

  const handleRenameFolder = async () => {
    const newName = renameValue.trim();
    if (!renamingFolder || !newName) return;

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename_folder",
          oldFolderName: renamingFolder,
          newFolderName: newName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.folders) setFolders(data.folders);
        if (data.notes) setNotes(data.notes);
        if (activeFolder === renamingFolder) {
          setActiveFolder(newName);
        }
        setRenamingFolder(null);
        setRenameValue("");
        setStatusMessage(`Folder renamed to "${newName}"!`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error renaming folder:", err);
    }
  };

  const handleDeleteFolder = async (folderName, e) => {
    if (e) e.stopPropagation();
    if (
      !confirm(
        `Are you sure you want to delete folder "${folderName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_folder",
          folderName,
          moveToFolder: "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.folders) setFolders(data.folders);
        if (data.notes) setNotes(data.notes);
        if (activeFolder === folderName) setActiveFolder(null);
        setStatusMessage(`Folder "${folderName}" deleted.`);
        setTimeout(() => setStatusMessage(""), 3500);
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const handleMoveNote = async (noteId, targetFolder) => {
    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_note",
          id: noteId,
          targetFolder,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.notes) setNotes(data.notes);
        if (data.folders) setFolders(data.folders);
        setMovingNoteId(null);
        setStatusMessage(`Note moved to folder "${targetFolder}"! 📂`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error moving note:", err);
    }
  };

  // ── Note Actions ─────────────────────────────────────────────────────────────
  const handleOpenCreate = (prefilledCategory = null) => {
    setEditingNote(null);
    setFormTitle("");
    setFormCategory(prefilledCategory || activeFolder || (folders[0]?.name || ""));
    setFormContent("");
    setFormPinned(false);
    setFormColor("cyan");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormTitle(note.title || "");
    setFormCategory(note.category || (folders[0]?.name || ""));
    setFormContent(note.content || "");
    setFormPinned(Boolean(note.pinned));
    setFormColor(note.color || "cyan");
    setIsEditorOpen(true);
    if (viewingNote) setViewingNote(null);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() && !formContent.trim()) {
      alert("Please enter a title or note content.");
      return;
    }

    setSaving(true);
    const payload = {
      id: editingNote ? editingNote.id : undefined,
      title: formTitle.trim() || "Untitled Note",
      category: formCategory.trim() || "General",
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
        if (data.folders) setFolders(data.folders);
        setIsEditorOpen(false);
        setStatusMessage(`Note saved in folder "${payload.category}"! 💾`);
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        alert(data.error || "Failed to save note.");
      }
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setSaving(false);
    }
  };

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

  const handleDeleteNote = async (id, title, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch("/api/king/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
        if (data.folders) setFolders(data.folders);
        if (viewingNote && viewingNote.id === id) setViewingNote(null);
        setStatusMessage("Note deleted 🗑️");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleCopyNote = (note, e) => {
    if (e) e.stopPropagation();
    const textToCopy = `${note.title}\n[Folder: ${note.category}]\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2500);
  };

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
          marginBottom: "1.6rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.7rem", margin: "0 0 6px", fontWeight: 800 }}>
            🗂️ Folder Vault & <span className="gradient-text">Category Notes</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Folder-organized personal knowledge vault. Notes are categorized and saved into dedicated category folders.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              fontSize: "0.9rem",
            }}
          >
            <span>📁</span> + New Category Folder
          </button>

          <button
            onClick={() => handleOpenCreate(activeFolder)}
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              fontSize: "0.9rem",
            }}
          >
            <span>➕</span> New Note
          </button>
        </div>
      </div>

      {/* ── Status Message Alert ── */}
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

      {/* ── Breadcrumb & Navigation Bar ── */}
      <div
        className="glass-card"
        style={{
          padding: "1rem 1.4rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Breadcrumb Path */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setActiveFolder(null);
              setNavMode("folder_explorer");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: activeFolder ? "var(--accent-cyan)" : "var(--text-primary)",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: 0,
            }}
          >
            <span>🗂️</span> Vault Root (All Folders)
          </button>

          {activeFolder && (
            <>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-primary)",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                }}
              >
                <span>📁</span> {activeFolder}
              </span>
              <button
                onClick={() => setActiveFolder(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </>
          )}
        </div>

        {/* View Switchers */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => {
              setNavMode("folder_explorer");
              setActiveFolder(null);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: navMode === "folder_explorer" && !activeFolder ? "1px solid var(--accent-cyan)" : "1px solid transparent",
              background: navMode === "folder_explorer" && !activeFolder ? "rgba(56, 189, 248, 0.15)" : "transparent",
              color: navMode === "folder_explorer" && !activeFolder ? "var(--accent-cyan)" : "var(--text-secondary)",
            }}
          >
            📁 Folders Directory
          </button>

          <button
            onClick={() => {
              setNavMode("flat_notes");
              setActiveFolder(null);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: navMode === "flat_notes" ? "1px solid var(--accent-cyan)" : "1px solid transparent",
              background: navMode === "flat_notes" ? "rgba(56, 189, 248, 0.15)" : "transparent",
              color: navMode === "flat_notes" ? "var(--accent-cyan)" : "var(--text-secondary)",
            }}
          >
            📑 All Notes ({notes.length})
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODE 1: FOLDER EXPLORER (Category Folders Grid) ──────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {navMode === "folder_explorer" && !activeFolder && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>
              📁 Category Folders ({computedFolderCards.length})
            </h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {computedFolderCards.length === 0 ? "No active folders. Click create to add one." : "Click any folder to view and add notes within that category."}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.2rem",
              marginBottom: "2.5rem",
            }}
          >
            {computedFolderCards.map((folder) => {
              const accent = ACCENT_COLORS[folder.color] || ACCENT_COLORS.cyan;

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.name)}
                  className="glass-card"
                  style={{
                    padding: "1.4rem",
                    borderRadius: 14,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderLeft: `4px solid ${accent.text}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  <div>
                    {/* Top folder row: icon, name, actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: accent.bg,
                          border: `1px solid ${accent.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        📁
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingFolder(folder.name);
                            setRenameValue(folder.name);
                          }}
                          title="Rename Folder"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: 13,
                            padding: "2px 4px",
                          }}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => handleDeleteFolder(folder.name, e)}
                          title="Delete Folder"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#f43f5e",
                            cursor: "pointer",
                            fontSize: 13,
                            padding: "2px 4px",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Folder Title */}
                    <h4 style={{ fontSize: "1.15rem", margin: "0 0 6px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {folder.name}
                    </h4>

                    {/* Description */}
                    <p style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {folder.description}
                    </p>
                  </div>

                  {/* Folder Footer / Stats */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "10px",
                      borderTop: "1px solid var(--border-subtle)",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: accent.text }}>
                      📄 {folder.noteCount} {folder.noteCount === 1 ? "Note" : "Notes"}
                    </span>
                    {folder.pinnedCount > 0 && (
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                        📌 {folder.pinnedCount} pinned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* "+ New Folder" Card */}
            <div
              onClick={() => setIsFolderModalOpen(true)}
              className="glass-card"
              style={{
                padding: "1.4rem",
                borderRadius: 14,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed rgba(56, 189, 248, 0.3)",
                background: "rgba(56, 189, 248, 0.03)",
                minHeight: 180,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "var(--accent-cyan)",
                  marginBottom: 10,
                }}
              >
                ➕
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--accent-cyan)", marginBottom: 4 }}>
                Create Category Folder
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Add custom folder for your tech domain
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODE 2: INSIDE A SPECIFIC FOLDER OR FLAT NOTES LIST ─────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {(activeFolder || navMode === "flat_notes") && (
        <div>
          {/* Folder Context Header if activeFolder */}
          {activeFolder && (
            <div
              className="glass-card"
              style={{
                padding: "1.4rem",
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                background: "var(--bg-surface)",
                borderLeft: "4px solid var(--accent-cyan)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>📁</span>
                  <h3 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                    Folder: {activeFolder}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "2px 10px",
                      borderRadius: 12,
                      background: "rgba(56, 189, 248, 0.2)",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    {displayedNotes.length} Notes in this folder
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  All notes created or moved into this category folder are saved together.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleOpenCreate(activeFolder)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", padding: "8px 16px" }}
                >
                  ➕ Add Note to {activeFolder}
                </button>
              </div>
            </div>
          )}

          {/* Search Box & Controls */}
          <div
            className="glass-card"
            style={{
              padding: "1rem 1.4rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* Search Input */}
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
                placeholder={
                  activeFolder
                    ? `Search notes inside "${activeFolder}" folder...`
                    : "Search notes across all categories..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px 9px 38px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
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

            {/* Flat Notes Category Selector (only in flat mode) */}
            {navMode === "flat_notes" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                }}
              >
                <option value="All">All Category Folders</option>
                {allCategoryNames.map((cat) => (
                  <option key={cat} value={cat}>
                    📁 {cat}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode (Grid vs List) */}
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  background: viewMode === "grid" ? "var(--accent-cyan)" : "transparent",
                  color: viewMode === "grid" ? "var(--text-on-accent)" : "var(--text-secondary)",
                }}
              >
                🔲 Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  background: viewMode === "list" ? "var(--accent-cyan)" : "transparent",
                  color: viewMode === "list" ? "var(--text-on-accent)" : "var(--text-secondary)",
                }}
              >
                📑 List
              </button>
            </div>
          </div>

          {/* Notes Content */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading folder notes...
            </div>
          ) : displayedNotes.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem" }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
              <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px", color: "var(--text-primary)" }}>
                No notes found
              </h3>
              <p style={{ fontSize: "0.92rem", marginBottom: "1.2rem" }}>
                {activeFolder
                  ? `Folder "${activeFolder}" is currently empty. Add your first note here!`
                  : "No notes match the current filters."}
              </p>
              <button
                onClick={() => handleOpenCreate(activeFolder)}
                className="btn-primary"
                style={{ fontSize: "0.9rem" }}
              >
                ➕ Create Note in {activeFolder || "Vault"}
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ── Grid View ── */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.4rem",
                marginBottom: "2.5rem",
              }}
            >
              {displayedNotes.map((note) => {
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
                      borderLeft: `4px solid ${accent.text}`,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div>
                      {/* Note Header: Folder Badge & Pin */}
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
                            padding: "2px 8px",
                            borderRadius: 6,
                            color: accent.text,
                            background: accent.bg,
                            border: `1px solid ${accent.border}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>📁</span> {note.category}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {note.pinned && (
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

                      {/* Note Title */}
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

                    {/* Card Footer: Folder Move, Actions */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "10px",
                        borderTop: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {/* Move to folder quick selector */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={note.category}
                          onChange={(e) => handleMoveNote(note.id, e.target.value)}
                          style={{
                            padding: "3px 6px",
                            background: "var(--input-bg)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: 6,
                            color: "var(--text-primary)",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                          title="Move note to another folder"
                        >
                          {allCategoryNames.map((cat) => (
                            <option key={cat} value={cat}>
                              📂 {cat}
                            </option>
                          ))}
                        </select>
                      </div>

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
                          {copiedNoteId === note.id ? "✓" : "📋"}
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
                          ✏️
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
            /* ── List View ── */
            <div className="glass-card" style={{ padding: "0.5rem", marginBottom: "2.5rem", display: "grid", gap: 4 }}>
              {displayedNotes.map((note) => {
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
                          padding: "2px 8px",
                          borderRadius: 6,
                          color: accent.text,
                          background: accent.bg,
                          whiteSpace: "nowrap",
                        }}
                      >
                        📁 {note.category}
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

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CREATE NEW CATEGORY FOLDER ─────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {isFolderModalOpen && (
        <div
          onClick={() => setIsFolderModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 30, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 500,
              width: "100%",
              padding: "2rem",
              borderRadius: 16,
              border: "1px solid var(--accent-cyan)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span>📁</span> Create New Category Folder
              </h3>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Folder / Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Microservices, DevOps, Flutter, Cryptography..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Folder Theme Color
                </label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {Object.keys(ACCENT_COLORS).map((colorKey) => {
                    const colorObj = ACCENT_COLORS[colorKey];
                    const isSelected = newFolderColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewFolderColor(colorKey)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: colorObj.text,
                          border: isSelected ? "3px solid #ffffff" : "2px solid transparent",
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Folder Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Architecture templates and microservice notes..."
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: "0.88rem" }}>
                  📁 Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: RENAME FOLDER ─────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {renamingFolder && (
        <div
          onClick={() => setRenamingFolder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 30, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440, width: "100%", padding: "1.8rem", borderRadius: 14 }}
          >
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 12px" }}>✏️ Rename Category Folder</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 14px" }}>
              Renaming folder &ldquo;{renamingFolder}&rdquo; will automatically update all notes inside it.
            </p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--input-bg)",
                border: "1px solid var(--accent-cyan)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setRenamingFolder(null)}
                className="btn-secondary"
                style={{ fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="btn-primary"
                style={{ fontSize: "0.85rem" }}
              >
                Save New Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CREATE / EDIT NOTE (FOLDER SELECTOR) ──────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {isEditorOpen && (
        <div
          onClick={() => setIsEditorOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
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
              borderRadius: 16,
            }}
          >
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
                style={{ background: "transparent", border: "none", fontSize: 20, color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Note Title *
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
                  }}
                />
              </div>

              {/* Folder / Category Selection */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Category Folder 📁 *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {allCategoryNames.map((cat) => (
                      <option key={cat} value={cat}>
                        📁 {cat}
                      </option>
                    ))}
                  </select>
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
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: colorObj.text,
                            border: isSelected ? "3px solid #ffffff" : "2px solid transparent",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 0 10px rgba(255,255,255,0.6)" : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div style={{ marginBottom: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Note Content & Code Snippets
                </label>
                <textarea
                  rows={9}
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
                    fontFamily: formCategory && formCategory.includes("DSA") ? "var(--font-mono)" : "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Pinned Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent-cyan)" }}
                />
                <label htmlFor="pinCheck" style={{ fontSize: "0.9rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  📌 Pin this note to the top of the folder
                </label>
              </div>

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
                  {saving ? "Saving..." : editingNote ? "Update Note 💾" : "Save to Folder 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: FULL NOTE READER ──────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {viewingNote && (
        <div
          onClick={() => setViewingNote(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
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
              border: `1px solid ${
                (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).border
              }`,
            }}
          >
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
                      padding: "2px 8px",
                      borderRadius: 6,
                      color: (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).text,
                      background: (ACCENT_COLORS[viewingNote.color] || ACCENT_COLORS.cyan).bg,
                    }}
                  >
                    📁 {viewingNote.category}
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
                style={{ background: "transparent", border: "none", fontSize: 22, color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: viewingNote.category && viewingNote.category.includes("DSA") ? "var(--font-mono)" : "inherit",
              }}
            >
              {viewingNote.content}
            </div>

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
                Folder: {viewingNote.category}
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
    </div>
  );
}
