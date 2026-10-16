"use client";

import { useState, useEffect } from "react";

export default function PersonalVault() {
  const [quickNotes, setQuickNotes] = useState("");
  const [savedStatus, setSavedStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("king_vault_notes");
    if (saved) setQuickNotes(saved);
  }, []);

  const handleSaveNotes = () => {
    localStorage.setItem("king_vault_notes", quickNotes);
    setSavedStatus("Saved to personal vault!");
    setTimeout(() => setSavedStatus(""), 3000);
  };

  const checklistItems = [
    { title: "GitHub Personal Access Token (PAT)", status: "Active in .env.local", icon: "🐙" },
    { title: "LeetCode GraphQL Integration", status: "Active & Caching", icon: "⚡" },
    { title: "SVERI COE College ID & Placement Portal", status: "Ready & Updated", icon: "🏛️" },
    { title: "Master Resume PDF (Next.js, Android, AI)", status: "Updated Oct 2026", icon: "📄" },
    { title: "Production Deployment (Vercel / Turbopack)", status: "Optimized Build Passing", icon: "🚀" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
          🔐 Personal <span className="gradient-text">Vault & Private Notes</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
          Secure workspace for personal interview prep notes, credentials checklist, and private drafts.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Quick Scratchpad */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📝</span> Private Scratchpad
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
            Saves automatically to your browser&apos;s local vault.
          </p>
          <textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            rows={10}
            placeholder="Write interview notes, LeetCode patterns (Sliding Window, Monotonic Stack), or secret project ideas here..."
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "#f8fafc",
              fontSize: "0.9rem",
              fontFamily: "var(--font-mono)",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: "0.85rem", color: "#34d399" }}>{savedStatus}</span>
            <button onClick={handleSaveNotes} className="btn-primary" style={{ fontSize: "0.88rem", padding: "8px 16px" }}>
              Save Notes 💾
            </button>
          </div>
        </div>

        {/* Credentials & Key Checklist */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🛡️</span> System & Credentials Status
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>
            Quick checklist of portfolio environment configs and active integrations.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
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
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "12px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: 8,
              fontSize: "0.82rem",
              color: "#93c5fd",
            }}
          >
            💡 <strong>Security Tip:</strong> Never commit your <code>.env.local</code> or secret tokens into public git repositories.
          </div>
        </div>
      </div>
    </div>
  );
}
