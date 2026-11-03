"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const ACCENT_COLORS = {
  cyan: { border: "rgba(56, 189, 248, 0.4)", text: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", glow: "rgba(56, 189, 248, 0.25)", icon: "📁" },
  emerald: { border: "rgba(16, 185, 129, 0.4)", text: "#34d399", bg: "rgba(16, 185, 129, 0.12)", glow: "rgba(16, 185, 129, 0.25)", icon: "📂" },
  purple: { border: "rgba(168, 85, 247, 0.4)", text: "#c084fc", bg: "rgba(168, 85, 247, 0.12)", glow: "rgba(168, 85, 247, 0.25)", icon: "📁" },
  amber: { border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)", glow: "rgba(245, 158, 11, 0.25)", icon: "📂" },
  rose: { border: "rgba(244, 63, 94, 0.4)", text: "#fb7185", bg: "rgba(244, 63, 94, 0.12)", glow: "rgba(244, 63, 94, 0.25)", icon: "📁" },
};

export default function PersonalVault() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Navigation mode: 'folder_explorer' | 'flat_notes'
  const [navMode, setNavMode] = useState("folder_explorer");
  const [activeFolder, setActiveFolder] = useState(null); // null = root or string folder name

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Folder modal states
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

  // Reader / Dossier inspection modal state
  const [viewingNote, setViewingNote] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  // Moving note state
  const [movingNoteId, setMovingNoteId] = useState(null);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3500);
  };

  // Fetch vault data
  const fetchVaultData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/king/vault");
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.notes)) setNotes(data.notes);
        if (Array.isArray(data.folders)) setFolders(data.folders);
      } else {
        setError(data.error || "Failed to load classified vault data.");
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

  // Folder cards with strictly real-time note counts (no phantom demo folders)
  const computedFolderCards = useMemo(() => {
    const map = new Map();

    folders.forEach((f) => {
      const key = f.name.toLowerCase().trim();
      map.set(key, {
        id: f.id,
        name: f.name.trim(),
        color: f.color || "cyan",
        description: f.description || `Classified notes in ${f.name}`,
        noteCount: 0,
        pinnedCount: 0,
        recentTitle: null,
      });
    });

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

  // Filtered notes based on active folder, search term, and pinned filter
  const displayedNotes = useMemo(() => {
    return notes.filter((n) => {
      if (activeFolder) {
        if ((n.category || "").toLowerCase() !== activeFolder.toLowerCase()) {
          return false;
        }
      }

      if (filterPinnedOnly && !n.pinned) return false;

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term)) ||
        (n.category && n.category.toLowerCase().includes(term))
      );
    });
  }, [notes, activeFolder, filterPinnedOnly, searchTerm]);

  // ── Folder Actions ─────────────────────────────────────────────────────────
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
        showStatus(`📁 Folder "${trimmed}" initialized in secure directory!`);
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
        showStatus(`Folder renamed to "${newName}".`);
      }
    } catch (err) {
      console.error("Error renaming folder:", err);
    }
  };

  const handleDeleteFolder = async (folderName, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete folder "${folderName}"? Notes inside will become uncategorized.`)) {
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
        setFolders(data.folders || []);
        if (data.notes) setNotes(data.notes);
        if (activeFolder === folderName) setActiveFolder(null);
        showStatus(`Folder "${folderName}" deleted. No demo folders re-created.`);
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
        showStatus(`Note moved to folder "${targetFolder || "Uncategorized"}"!`);
      }
    } catch (err) {
      console.error("Error moving note:", err);
    }
  };

  // ── Note Actions ───────────────────────────────────────────────────────────
  const handleOpenCreate = (prefilledFolder = null) => {
    setEditingNote(null);
    setFormTitle("");
    setFormCategory(prefilledFolder || activeFolder || (folders[0]?.name || ""));
    setFormContent("");
    setFormPinned(false);
    setFormColor("cyan");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note, e) => {
    if (e) e.stopPropagation();
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
      alert("Please enter a note title or content.");
      return;
    }

    setSaving(true);
    const payload = {
      id: editingNote ? editingNote.id : undefined,
      title: formTitle.trim() || "Untitled Note",
      category: formCategory.trim() || "",
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
        showStatus(`Dossier saved successfully in "${payload.category || "Uncategorized"}"!`);
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
    if (!confirm(`Purge classified note "${title}" permanently?`)) return;

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
        showStatus("Note purged 🗑️");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleCopyNote = (note, e) => {
    if (e) e.stopPropagation();
    const textToCopy = `${note.title}\n[Folder: ${note.category || "Uncategorized"}]\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2500);
  };

  return (
    <div>
      {/* ── Status Message Banner ── */}
      {statusMessage && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 700,
            background: "rgba(16, 185, 129, 0.95)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            animation: "slideInToast 0.25s ease-out",
          }}
        >
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── Movie-Style Classified Header HUD ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.4rem",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🗂️</span>
            <h2 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Classified Field Notes &amp; <span className="gradient-text">Vault Directory</span>
            </h2>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "0.9rem" }}>
            High-security knowledge archive. Folder-organized personal intelligence dossiers with zero demo leak.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="btn-secondary"
            style={{
              padding: "8px 14px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 800,
            }}
          >
            <span>📁</span> + New Folder
          </button>

          <button
            onClick={() => handleOpenCreate(activeFolder)}
            className="btn-primary"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 800,
            }}
          >
            <span>➕</span> New Note
          </button>
        </div>
      </div>

      {/* ── Movie-Style Breadcrumbs & Search HUD ── */}
      <div
        className="glass-card"
        style={{
          padding: "10px 16px",
          marginBottom: "1.4rem",
          borderRadius: 12,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Breadcrumb Route */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.9rem" }}>
          <button
            onClick={() => {
              setActiveFolder(null);
              setNavMode("folder_explorer");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: activeFolder ? "var(--accent-brand)" : "var(--text-primary)",
              fontWeight: 800,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>[ VAULT ROOT ]</span>
          </button>

          {activeFolder && (
            <>
              <span style={{ color: "var(--text-secondary)" }}>/</span>
              <span style={{ fontWeight: 900, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>📁</span> {activeFolder}
              </span>
              <button
                onClick={() => setActiveFolder(null)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
              >
                ← Back to All Folders
              </button>
            </>
          )}
        </div>

        {/* Search & Mode Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search dossiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              background: "var(--input-bg)",
              border: "1px solid var(--border-light)",
              borderRadius: 6,
              color: "var(--text-primary)",
              minWidth: 180,
            }}
          />

          <button
            onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              border: filterPinnedOnly ? "1px solid #fbbf24" : "1px solid var(--border-subtle)",
              background: filterPinnedOnly ? "rgba(245, 158, 11, 0.15)" : "transparent",
              color: filterPinnedOnly ? "#fbbf24" : "var(--text-secondary)",
            }}
          >
            📌 Pinned Only
          </button>

          <button
            onClick={() => {
              setNavMode(navMode === "folder_explorer" ? "flat_notes" : "folder_explorer");
              setActiveFolder(null);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
            }}
          >
            {navMode === "folder_explorer" ? `📑 All Notes (${notes.length})` : `📁 Folders (${folders.length})`}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 1: FOLDER EXPLORER (Category Folders Grid)
      ──────────────────────────────────────────────────────────────────── */}
      {navMode === "folder_explorer" && !activeFolder && (
        <div style={{ marginBottom: "2rem" }}>
          {computedFolderCards.length === 0 ? (
            /* Cinematic Empty State: NEVER shows any demo folder */
            <div
              className="glass-card"
              style={{
                padding: "3.5rem 1.5rem",
                textAlign: "center",
                borderRadius: 14,
                background: "var(--bg-surface)",
                border: "1.5px dashed var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📁</div>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 6px", fontWeight: 900, color: "var(--text-primary)" }}>
                VAULT DIRECTORY EMPTY
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: 440, margin: "0 auto 1.4rem", lineHeight: 1.5 }}>
                All category folders have been cleared. No demo folders will be recreated. Click below to initialize a new classified folder.
              </p>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="btn-lime"
                style={{ padding: "9px 22px", fontSize: "0.9rem", fontWeight: 800 }}
              >
                + Initialize Classified Folder
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
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
                      borderRadius: 12,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderLeft: `4px solid ${accent.text}`,
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderLeftColor: accent.text,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div>
                      {/* Top folder row: Icon, Watermark & Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: accent.bg,
                            border: `1px solid ${accent.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          📁
                        </div>

                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-secondary)", opacity: 0.7 }}>
                            // SEC-FOLDER
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingFolder(folder.name);
                              setRenameValue(folder.name);
                            }}
                            title="Rename Folder"
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}
                          >
                            ✏️
                          </button>

                          <button
                            onClick={(e) => handleDeleteFolder(folder.name, e)}
                            title="Delete Folder"
                            style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Folder Title */}
                      <h4 style={{ fontSize: "1.15rem", margin: "0 0 6px", fontWeight: 800, color: "var(--text-primary)" }}>
                        {folder.name}
                      </h4>

                      {/* Description */}
                      <p style={{ margin: "0 0 12px", fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {folder.description}
                      </p>
                    </div>

                    {/* Footer / Stats */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 8,
                        borderTop: "1px solid var(--border-subtle)",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: accent.text }}>
                        📄 {folder.noteCount} {folder.noteCount === 1 ? "File" : "Files"}
                      </span>
                      {folder.pinnedCount > 0 && (
                        <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                          📌 {folder.pinnedCount} pinned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Folder Card */}
              <div
                onClick={() => setIsFolderModalOpen(true)}
                className="glass-card"
                style={{
                  padding: "1.4rem",
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed var(--border-subtle)",
                  background: "var(--bg-base)",
                  minHeight: 160,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>➕</div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--accent-brand)" }}>
                  Create Classified Folder
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                  Organize your tech domains &amp; private notes
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 2: NOTES LISTING (Within active folder OR all notes view)
      ──────────────────────────────────────────────────────────────────── */}
      {(activeFolder || navMode === "flat_notes") && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
              {activeFolder ? `📁 ${activeFolder} (${displayedNotes.length} notes)` : `📑 All Classified Notes (${displayedNotes.length})`}
            </h3>

            <button
              onClick={() => handleOpenCreate(activeFolder)}
              className="btn-lime"
              style={{ fontSize: "0.82rem", padding: "6px 14px", fontWeight: 800 }}
            >
              + Add Note Here
            </button>
          </div>

          {displayedNotes.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "2.5rem 1.5rem",
                textAlign: "center",
                borderRadius: 12,
                background: "var(--bg-surface)",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
                No notes found in this view. Click &ldquo;+ Add Note Here&rdquo; to draft a new dossier.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 12,
              }}
            >
              {displayedNotes.map((note) => {
                const accent = ACCENT_COLORS[note.color] || ACCENT_COLORS.cyan;

                return (
                  <div
                    key={note.id}
                    onClick={() => setViewingNote(note)}
                    className="glass-card"
                    style={{
                      padding: "1.2rem",
                      borderRadius: 12,
                      background: "var(--bg-surface)",
                      border: note.pinned ? "1.5px solid #fbbf24" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.15s ease",
                      position: "relative",
                    }}
                  >
                    <div>
                      {/* Top Header: Pin, Category Tag, Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(note.id, e)}
                            title={note.pinned ? "Unpin Note" : "Pin to Top"}
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: 14,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            {note.pinned ? "📌" : "📍"}
                          </button>

                          {note.category ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 10,
                                background: accent.bg,
                                color: accent.text,
                                border: `1px solid ${accent.border}`,
                              }}
                            >
                              📁 {note.category}
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Uncategorized</span>
                          )}
                        </div>

                        {/* Note Actions */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyNote(note, e)}
                            title="Copy Note Text"
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}
                          >
                            {copiedNoteId === note.id ? "✓" : "📋"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(note, e)}
                            title="Edit Note"
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNote(note.id, note.title, e)}
                            title="Delete Note"
                            style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12 }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: "1.05rem", margin: "0 0 6px", fontWeight: 800, color: "var(--text-primary)" }}>
                        {note.title}
                      </h4>

                      {/* Content Preview */}
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: "0.84rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {note.content}
                      </p>
                    </div>

                    {/* Footer Date & Move Dropdown */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 8,
                        borderTop: "1px solid var(--border-subtle)",
                        fontSize: 11,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>
                        {new Date(note.updatedAt || note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>

                      {/* Move Folder Dropdown */}
                      <select
                        value={note.category || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMoveNote(note.id, e.target.value)}
                        style={{
                          padding: "2px 6px",
                          fontSize: 10,
                          borderRadius: 4,
                          background: "var(--bg-base)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <option value="">Move to...</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.name}>
                            📁 {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: FULL-SCREEN CINEMATIC DOSSIER READER
      ════════════════════════════════════════════════════════════════════ */}
      {viewingNote && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "min(720px, 94vw)",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: "2rem",
              borderRadius: 16,
              background: "var(--bg-surface)",
              border: "1.5px solid var(--accent-brand)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--accent-brand)", fontWeight: 800 }}>
                    // CONFIDENTIAL DOSSIER
                  </span>
                  {viewingNote.category && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "var(--badge-bg)", color: "var(--text-secondary)" }}>
                      📁 {viewingNote.category}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.4rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
                  {viewingNote.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewingNote(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Note Body with Monospace / Markdown styling */}
            <div
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                marginBottom: 20,
                padding: "12px",
                borderRadius: 8,
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {viewingNote.content}
            </div>

            {/* Actions Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                Created: {new Date(viewingNote.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={(e) => handleCopyNote(viewingNote, e)}
                  className="btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                >
                  {copiedNoteId === viewingNote.id ? "✓ Copied" : "📋 Copy Plaintext"}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(viewingNote)}
                  className="btn-lime"
                  style={{ fontSize: "0.85rem", padding: "6px 16px" }}
                >
                  ✏️ Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: NOTE EDITOR
      ════════════════════════════════════════════════════════════════════ */}
      {isEditorOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <form
            onSubmit={handleSaveNote}
            className="glass-card"
            style={{
              width: "min(680px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.8rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "1.5px solid var(--accent-brand)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                {editingNote ? "✏️ Edit Classified Note" : "➕ Draft Classified Note"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                Note Title *
              </label>
              <input
                type="text"
                placeholder="e.g. System Design Cache Patterns, Interview STAR Stories..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Assign to Folder
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="">Uncategorized</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.name}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Color Badge
                </label>
                <select
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="cyan">Cyan</option>
                  <option value="emerald">Emerald</option>
                  <option value="purple">Purple</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                  />
                  <span>📌 Pin to Top</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                Content (Markdown / Plaintext) *
              </label>
              <textarea
                rows={10}
                placeholder="Draft your notes, code snippets, architectural ideas..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-lime"
                style={{ padding: "8px 20px", fontSize: "0.85rem", fontWeight: 800 }}
              >
                {saving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: CREATE NEW CLASSIFIED FOLDER
      ════════════════════════════════════════════════════════════════════ */}
      {isFolderModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <form
            onSubmit={handleCreateFolder}
            className="glass-card"
            style={{
              width: "min(480px, 94vw)",
              padding: "1.8rem",
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "1.5px solid var(--accent-brand)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                📁 Initialize Classified Folder
              </h3>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                Folder Name *
              </label>
              <input
                type="text"
                placeholder="e.g. System Design, AI Engine, Confidential..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                Folder Mission / Description
              </label>
              <input
                type="text"
                placeholder="Brief description of what goes in here..."
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                Cyber Accent Color
              </label>
              <select
                value={newFolderColor}
                onChange={(e) => setNewFolderColor(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                }}
              >
                <option value="cyan">Cyan Cyber</option>
                <option value="emerald">Emerald Terminal</option>
                <option value="purple">Purple Nebula</option>
                <option value="amber">Amber Horizon</option>
                <option value="rose">Rose Matrix</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-lime"
                style={{ padding: "8px 20px", fontSize: "0.85rem", fontWeight: 800 }}
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: RENAME FOLDER
      ════════════════════════════════════════════════════════════════════ */}
      {renamingFolder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "min(400px, 94vw)",
              padding: "1.5rem",
              borderRadius: 12,
              background: "var(--bg-surface)",
              border: "1px solid var(--accent-brand)",
            }}
          >
            <h4 style={{ fontSize: "1.1rem", margin: "0 0 10px", fontWeight: 800, color: "var(--text-primary)" }}>
              Rename Folder
            </h4>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setRenamingFolder(null)}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="btn-lime"
                style={{ padding: "6px 16px", fontSize: "0.82rem", fontWeight: 800 }}
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}