"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Award,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Building,
  GraduationCap,
} from "lucide-react";

const emptyInternship = {
  role: "",
  company: "",
  period: "",
  type: "Internship",
  description: "",
  contributions: "",
  skills: "Next.js, React, Node.js",
  verified: true,
};

const emptyAchievement = {
  title: "",
  issuer: "",
  date: "",
  description: "",
  badge: "Verified",
  credentialUrl: "",
};

export default function ExperienceManager() {
  const [internships, setInternships] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const [activeSubTab, setActiveSubTab] = useState("internships"); // "internships" | "achievements"

  // Internship form state
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [editingInternshipId, setEditingInternshipId] = useState(null);
  const [internshipForm, setInternshipForm] = useState(emptyInternship);

  // Achievement form state
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState(null);
  const [achievementForm, setAchievementForm] = useState(emptyAchievement);

  const loadData = async () => {
    try {
      const res = await fetch("/api/king/experience");
      const data = await res.json();
      if (data.internships) setInternships(data.internships);
      if (data.achievements) setAchievements(data.achievements);
    } catch (err) {
      console.error("Error loading experience data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Internship Handlers ──────────────────────────────────────────────────
  const handleOpenAddInternship = () => {
    setEditingInternshipId(null);
    setInternshipForm(emptyInternship);
    setShowInternshipForm(true);
  };

  const handleOpenEditInternship = (item) => {
    setEditingInternshipId(item.id);
    setInternshipForm({
      role: item.role || "",
      company: item.company || "",
      period: item.period || "",
      type: item.type || "Internship",
      description: item.description || "",
      contributions: Array.isArray(item.contributions) ? item.contributions.join("\n") : item.contributions || "",
      skills: Array.isArray(item.skills) ? item.skills.join(", ") : item.skills || "",
      verified: Boolean(item.verified),
    });
    setShowInternshipForm(true);
  };

  const handleSaveInternship = async (e) => {
    e.preventDefault();
    if (!internshipForm.role.trim() || !internshipForm.company.trim()) return;

    const action = editingInternshipId ? "update_internship" : "add_internship";
    const payload = {
      action,
      id: editingInternshipId,
      internship: {
        ...internshipForm,
        contributions: internshipForm.contributions
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean),
        skills: internshipForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };

    try {
      const res = await fetch("/api/king/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.internships) {
        setInternships(data.internships);
        setShowInternshipForm(false);
        setEditingInternshipId(null);
        setFeedback(editingInternshipId ? "Internship updated!" : "New internship added!");
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error saving internship:", err);
    }
  };

  const handleDeleteInternship = async (id, role, company) => {
    if (!confirm(`Delete "${role} at ${company}"?`)) return;

    try {
      const res = await fetch("/api/king/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_internship", id }),
      });
      const data = await res.json();
      if (data.internships) {
        setInternships(data.internships);
        setFeedback(`Deleted "${role}"`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting internship:", err);
    }
  };

  // ── Achievement Handlers ────────────────────────────────────────────────
  const handleOpenAddAchievement = () => {
    setEditingAchievementId(null);
    setAchievementForm(emptyAchievement);
    setShowAchievementForm(true);
  };

  const handleOpenEditAchievement = (item) => {
    setEditingAchievementId(item.id);
    setAchievementForm({
      title: item.title || "",
      issuer: item.issuer || "",
      date: item.date || "",
      description: item.description || "",
      badge: item.badge || "Verified",
      credentialUrl: item.credentialUrl || "",
    });
    setShowAchievementForm(true);
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    if (!achievementForm.title.trim()) return;

    const action = editingAchievementId ? "update_achievement" : "add_achievement";
    const payload = {
      action,
      id: editingAchievementId,
      achievement: achievementForm,
    };

    try {
      const res = await fetch("/api/king/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.achievements) {
        setAchievements(data.achievements);
        setShowAchievementForm(false);
        setEditingAchievementId(null);
        setFeedback(editingAchievementId ? "Achievement updated!" : "New achievement added!");
        setTimeout(() => setFeedback(""), 3500);
      }
    } catch (err) {
      console.error("Error saving achievement:", err);
    }
  };

  const handleDeleteAchievement = async (id, title) => {
    if (!confirm(`Delete achievement "${title}"?`)) return;

    try {
      const res = await fetch("/api/king/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_achievement", id }),
      });
      const data = await res.json();
      if (data.achievements) {
        setAchievements(data.achievements);
        setFeedback(`Deleted "${title}"`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting achievement:", err);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="section-tag">
            <Briefcase size={13} style={{ marginRight: 4 }} /> Career Milestones
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Experience &amp; Achievements <span className="lime-underline">Manager</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Add, edit, and verify industry internships, professional employment, competitive exam ranks, and credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={activeSubTab === "internships" ? handleOpenAddInternship : handleOpenAddAchievement}
          className="btn-lime"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px" }}
        >
          <Plus size={16} /> {activeSubTab === "internships" ? "New Internship / Role" : "New Achievement"}
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

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveSubTab("internships")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            background: activeSubTab === "internships" ? "var(--accent-brand)" : "transparent",
            color: activeSubTab === "internships" ? "var(--text-on-accent)" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Briefcase size={15} /> Industry Internships ({internships.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("achievements")}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            background: activeSubTab === "achievements" ? "var(--accent-brand)" : "transparent",
            color: activeSubTab === "achievements" ? "var(--text-on-accent)" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Award size={15} /> Verified Achievements ({achievements.length})
        </button>
      </div>

      {/* ── Sub Tab 1: Internships ── */}
      {activeSubTab === "internships" && (
        <div>
          {/* Internship Add/Edit Drawer */}
          {showInternshipForm && (
            <form onSubmit={handleSaveInternship} className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                  {editingInternshipId ? "Edit Internship" : "Add Industry Internship / Role"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInternshipForm(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Development Intern"
                      value={internshipForm.role}
                      onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
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
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Webvarad / Fourise Software"
                      value={internshipForm.company}
                      onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
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
                      Duration / Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dec 2025 – Apr 2026 (5 months)"
                      value={internshipForm.period}
                      onChange={(e) => setInternshipForm({ ...internshipForm, period: e.target.value })}
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
                    Executive Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short 1–2 sentence overview of your responsibilities..."
                    value={internshipForm.description}
                    onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Key Contributions (one bullet per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Designed REST microservices&#10;Optimized queries by 40%&#10;Mentored junior interns"
                    value={internshipForm.contributions}
                    onChange={(e) => setInternshipForm({ ...internshipForm, contributions: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Tech Stack &amp; Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Next.js, Spring Boot, PostgreSQL, Docker"
                    value={internshipForm.skills}
                    onChange={(e) => setInternshipForm({ ...internshipForm, skills: e.target.value })}
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowInternshipForm(false)}
                    className="btn-dark-pill"
                    style={{ padding: "8px 16px" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-lime" style={{ padding: "8px 20px" }}>
                    {editingInternshipId ? "Update Internship" : "Save Internship"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Internships List */}
          <div style={{ display: "grid", gap: "1rem" }}>
            {internships.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: "1.4rem",
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {item.role}
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
                      {item.company}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px", color: "var(--text-secondary)", marginBottom: 8 }}>
                    <Calendar size={13} /> {item.period}
                  </div>

                  <p style={{ margin: "0 0 8px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {item.description}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(Array.isArray(item.skills) ? item.skills : []).map((sk, skIdx) => (
                      <span
                        key={skIdx}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditInternship(item)}
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
                    onClick={() => handleDeleteInternship(item.id, item.role, item.company)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      color: "#f43f5e",
                      cursor: "pointer",
                    }}
                    title="Delete internship"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub Tab 2: Achievements ── */}
      {activeSubTab === "achievements" && (
        <div>
          {/* Achievement Form */}
          {showAchievementForm && (
            <form onSubmit={handleSaveAchievement} className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                  {editingAchievementId ? "Edit Achievement" : "Add Verified Achievement"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAchievementForm(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Selected for TCS Digital"
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
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
                      Awarding Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Consultancy Services"
                      value={achievementForm.issuer}
                      onChange={(e) => setAchievementForm({ ...achievementForm, issuer: e.target.value })}
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
                      Date / Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2025"
                      value={achievementForm.date}
                      onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
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
                    Achievement Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details about the selection process, exam, rank, or award..."
                    value={achievementForm.description}
                    onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Badge Text
                    </label>
                    <input
                      type="text"
                      placeholder="₹7 LPA Premier Role, 9.21 CGPA"
                      value={achievementForm.badge}
                      onChange={(e) => setAchievementForm({ ...achievementForm, badge: e.target.value })}
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
                      Verification URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://credential.net/..."
                      value={achievementForm.credentialUrl}
                      onChange={(e) => setAchievementForm({ ...achievementForm, credentialUrl: e.target.value })}
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAchievementForm(false)}
                    className="btn-dark-pill"
                    style={{ padding: "8px 16px" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-lime" style={{ padding: "8px 20px" }}>
                    {editingAchievementId ? "Update Achievement" : "Save Achievement"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Achievements Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {achievements.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: "1.4rem",
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Award size={18} style={{ color: "var(--accent-brand)" }} />
                      <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {item.title}
                      </span>
                    </div>
                    {item.badge && (
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
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: 8 }}>
                    {item.issuer} • {item.date}
                  </div>

                  <p style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
                  {item.credentialUrl ? (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "12px", color: "var(--accent-brand)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <ExternalLink size={12} /> View Certificate
                    </a>
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Verified Credential</span>
                  )}

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditAchievement(item)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAchievement(item.id, item.title)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        background: "rgba(244, 63, 94, 0.1)",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        color: "#f43f5e",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

