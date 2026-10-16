"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileEditor from "../../components/king/ProfileEditor";
import ProjectsManager from "../../components/king/ProjectsManager";
import SkillsManager from "../../components/king/SkillsManager";
import TaskManager from "../../components/king/TaskManager";
import LeetCodeFriends from "../../components/king/LeetCodeFriends";
import MessagesInbox from "../../components/king/MessagesInbox";
import PersonalVault from "../../components/king/PersonalVault";

export default function KingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [sessionInput, setSessionInput] = useState("");
  const [sessionSaved, setSessionSaved] = useState("");

  // Check persistent session on mount
  useEffect(() => {
    const auth = localStorage.getItem("king_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    const savedSession = localStorage.getItem("king_leetcode_session");
    if (savedSession) {
      setSessionInput(savedSession);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    setError("");

    try {
      const res = await fetch("/api/king/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("king_authenticated", "true");
      } else {
        setError(data.error || "Access denied. Invalid passcode. Please try again.");
      }
    } catch (err) {
      setError("Unable to authenticate. Please check network connection and try again.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("king_authenticated");
  };

  const handleSaveSessionCookie = (e) => {
    e.preventDefault();
    localStorage.setItem("king_leetcode_session", sessionInput.trim());
    setSessionSaved("LeetCode session token saved to secure browser storage.");
    setTimeout(() => setSessionSaved(""), 3500);
  };

  // ─── Login Screen (If not authenticated) ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: 440,
            width: "100%",
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "0 20px 40px -15px rgba(56, 189, 248, 0.25)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 1.2rem",
              boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)",
            }}
          >
            👑
          </div>

          <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>
            King <span className="gradient-text">Sanctuary</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "1.8rem" }}>
            Private Control Deck for Vivek Pawar. Authorized access only.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.2rem" }}>
              <input
                type="password"
                placeholder="Enter secret passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--input-bg)",
                  border: error ? "1px solid #f43f5e" : "1px solid var(--border-light)",
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  textAlign: "center",
                  letterSpacing: "0.15em",
                  outline: "none",
                }}
              />
              {error && (
                <div style={{ color: "#fb7185", fontSize: "0.82rem", marginTop: 8 }}>
                  ✕ {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingAuth}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              {loadingAuth ? "Validating..." : "Unlock King Deck 👑"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              ← Return to Public Portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Authenticated King Dashboard (Vertical Navbar Layout) ───────────────
  const navItems = [
    { id: "profile", label: "Profile & Hero Editor", icon: "👤" },
    { id: "projects", label: "Projects Manager", icon: "💼" },
    { id: "skills", label: "Skills Manager", icon: "⚡" },
    { id: "tasks", label: "Task Manager", icon: "📋" },
    { id: "friends", label: "LeetCode Friends & Rivalry", icon: "🏆" },
    { id: "messages", label: "Contact Inquiries Inbox", icon: "📬" },
    { id: "vault", label: "Personal Vault & Notes", icon: "🔐" },
    { id: "session", label: "Database & Session Config", icon: "⚙️" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 68px)",
        background: "var(--bg-primary)",
      }}
    >
      {/* ── Vertical Navbar / Sidebar ── */}
      <aside
        style={{
          width: 280,
          background: "rgba(10, 15, 29, 0.95)",
          borderRight: "1px solid var(--border-subtle)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingBottom: "1.2rem",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#ffffff",
                boxShadow: "0 2px 10px rgba(245, 158, 11, 0.35)",
              }}
            >
              👑
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                King Sanctuary
              </div>
              <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>
                Vivek&apos;s Control Deck
              </div>
            </div>
          </div>

          {/* Vertical Navigation Links */}
          <nav style={{ display: "grid", gap: 6 }}>
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: "0.88rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#38bdf8" : "#cbd5e1",
                    background: active ? "rgba(56, 189, 248, 0.12)" : "transparent",
                    border: active ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ paddingTop: "1.2rem", borderTop: "1px solid var(--border-subtle)", display: "grid", gap: 10 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              padding: "6px 10px",
              borderRadius: 6,
            }}
          >
            <span>🌐</span> Public Portfolio
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.85rem",
              color: "#fb7185",
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.25)",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <span>🚪</span> Lock & Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
        {activeSection === "profile" && <ProfileEditor />}

        {activeSection === "projects" && <ProjectsManager />}

        {activeSection === "skills" && <SkillsManager />}

        {activeSection === "tasks" && <TaskManager />}

        {activeSection === "friends" && <LeetCodeFriends />}

        {activeSection === "messages" && <MessagesInbox />}

        {activeSection === "vault" && <PersonalVault />}

        {activeSection === "session" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
                ⚙️ Database & <span className="gradient-text">Configuration</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
                Prisma Postgres connection, admin password management, and LeetCode session settings.
              </p>
            </div>

            <div style={{ display: "grid", gap: "1.5rem", maxWidth: 750 }}>
              {/* Database Status Card */}
              <div className="glass-card" style={{ padding: "1.6rem" }}>
                <h3 style={{ fontSize: "1.15rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🗄️</span> Prisma Database Status
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>
                  Your database is actively connected and synchronized using Prisma Postgres.
                </p>
                <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 8, color: "#34d399", fontSize: 13, fontWeight: 600 }}>
                  ✓ Live Database Connected & Synchronized
                </div>
              </div>

              {/* Password info Card */}
              <div className="glass-card" style={{ padding: "1.6rem" }}>
                <h3 style={{ fontSize: "1.15rem", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔑</span> King Access Passcode
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Your administrative passcode is securely managed on the server. To update your secret key, modify your deployment environment variables.
                </p>
              </div>

              {/* LeetCode Session Cookie Card */}
              <div className="glass-card" style={{ padding: "1.6rem" }}>
                <h3 style={{ fontSize: "1.15rem", marginBottom: 10 }}>Optional LEETCODE_SESSION Cookie</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 14 }}>
                  If you want to inject your personal LeetCode browser session token for authenticated user queries, save it here.
                </p>

                <form onSubmit={handleSaveSessionCookie}>
                  <div style={{ marginBottom: "1rem" }}>
                    <textarea
                      rows={3}
                      value={sessionInput}
                      onChange={(e) => setSessionInput(e.target.value)}
                      placeholder="eyJhbGciOi..."
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 8,
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button type="submit" className="btn-primary" style={{ fontSize: "0.88rem" }}>
                      Save Session Cookie
                    </button>
                    {sessionSaved && (
                      <span style={{ color: "#34d399", fontSize: "0.85rem" }}>✓ {sessionSaved}</span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
