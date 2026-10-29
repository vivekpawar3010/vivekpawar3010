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
import DatabaseInspector from "../../components/king/DatabaseInspector";

export default function KingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [stats, setStats] = useState({
    projects: 6,
    tasks: 0,
    messages: 0,
    unreadMessages: 0,
    vaultNotes: 0,
    dbStatus: "Online",
  });

  // Check persistent session on mount & load quick stats
  useEffect(() => {
    const auth = localStorage.getItem("king_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }

    // Quick stats fetch
    Promise.allSettled([
      fetch("/api/king/projects").then((r) => r.json()),
      fetch("/api/king/tasks").then((r) => r.json()),
      fetch("/api/king/messages").then((r) => r.json()),
      fetch("/api/king/vault").then((r) => r.json()),
    ]).then(([proj, task, msg, vault]) => {
      const msgs = msg.status === "fulfilled" && Array.isArray(msg.value?.messages) ? msg.value.messages : [];
      setStats({
        projects: proj.status === "fulfilled" && Array.isArray(proj.value?.projects) ? proj.value.projects.length : 6,
        tasks: task.status === "fulfilled" && Array.isArray(task.value?.tasks) ? task.value.tasks.length : 0,
        messages: msgs.length,
        unreadMessages: msgs.filter((m) => !m.read).length,
        vaultNotes: vault.status === "fulfilled" && Array.isArray(vault.value?.notes) ? vault.value.notes.length : 0,
        dbStatus: "Online",
      });
    });
  }, [isAuthenticated]);

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
    } catch {
      setError("Unable to authenticate. Please check network connection and try again.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("king_authenticated");
  };

  // ─── 1. Login Screen (Dark Futuristic Terminal Passcode) ─────────────────────
  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          background: "radial-gradient(circle at 50% 30%, rgba(200, 255, 69, 0.04) 0%, #05080D 70%)",
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: 440,
            width: "100%",
            padding: "2.8rem 2.2rem",
            textAlign: "center",
            boxShadow: "0 25px 50px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(200, 255, 69, 0.1)",
            border: "1px solid rgba(200, 255, 69, 0.35)",
            background: "rgba(11, 18, 28, 0.95)",
            borderRadius: 18,
          }}
        >
          {/* Glowing Badge */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(200, 255, 69, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
              border: "1px solid var(--accent-lime)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 1.4rem",
              boxShadow: "0 0 25px rgba(200, 255, 69, 0.35)",
            }}
          >
            👑
          </div>

          <div className="section-tag" style={{ justifyContent: "center", marginBottom: 6 }}>
            Admin Sanctuary
          </div>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              color: "#F5F7FA",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            King <span className="lime-underline">Deck</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "2rem" }}>
            Private Control Deck for Vivek Pawar. Authorized access only.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.4rem" }}>
              <input
                type="password"
                placeholder="Enter secret passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "rgba(5, 8, 13, 0.9)",
                  border: error ? "1px solid #f43f5e" : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 10,
                  color: "#F5F7FA",
                  fontSize: "1.05rem",
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
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
              className="btn-lime"
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "0.95rem" }}
            >
              {loadingAuth ? "Validating Key..." : "Unlock King Deck 👑"}
            </button>
          </form>

          <div style={{ marginTop: "1.8rem" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-lime)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <span>←</span> Return to Public Portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── 2. Authenticated King Dashboard ─────────────────────────────────────────
  const navItems = [
    { id: "profile", label: "Profile & Hero Editor", icon: "👤", badge: null },
    { id: "projects", label: "Projects Manager", icon: "💼", badge: stats.projects },
    { id: "skills", label: "Skills Manager", icon: "⚡", badge: null },
    { id: "tasks", label: "Task Tracker", icon: "📋", badge: stats.tasks },
    { id: "friends", label: "LeetCode Rivalry", icon: "🏆", badge: null },
    { id: "messages", label: "Inquiries Inbox", icon: "📬", badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : null },
    { id: "vault", label: "Personal Vault & Notes", icon: "🔐", badge: stats.vaultNotes > 0 ? stats.vaultNotes : null },
    { id: "inspector", label: "Database & Architecture", icon: "🗄️", badge: "Live" },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", background: "#05080D", display: "flex", flexDirection: "column" }}>
      {/* ── Top KPI & Live DB Strip ── */}
      <header
        style={{
          background: "rgba(11, 18, 28, 0.95)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0.8rem 1.8rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(200, 255, 69, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
              border: "1px solid var(--accent-lime)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            👑
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#F5F7FA" }}>
              King Sanctuary <span style={{ color: "var(--accent-lime)", fontSize: "12px" }}>v2.5</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8FF45", boxShadow: "0 0 6px #C8FF45" }} />
              PostgreSQL Connected &amp; Synced via Prisma
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Projects:</span>
            <span style={{ color: "var(--accent-lime)", fontWeight: 700 }}>{stats.projects}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Tasks:</span>
            <span style={{ color: "#22D3EE", fontWeight: 700 }}>{stats.tasks}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 8,
              background: stats.unreadMessages > 0 ? "rgba(244, 63, 94, 0.12)" : "rgba(255, 255, 255, 0.03)",
              border: stats.unreadMessages > 0 ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid var(--border-subtle)",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Inbox:</span>
            <span style={{ color: stats.unreadMessages > 0 ? "#f43f5e" : "#F5F7FA", fontWeight: 700 }}>
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : stats.messages}
            </span>
          </div>

          <Link
            href="/"
            className="btn-dark-pill"
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            <span>🌐</span> View Portfolio
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fb7185",
              padding: "6px 12px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Lock 🔒
          </button>
        </div>
      </header>

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 280,
            background: "rgba(10, 16, 24, 0.98)",
            borderRight: "1px solid var(--border-subtle)",
            padding: "1.5rem 1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0 10px 10px",
              }}
            >
              Control Navigation
            </div>

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
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      fontSize: "0.88rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#05080D" : "#cbd5e1",
                      background: active ? "var(--accent-lime)" : "transparent",
                      border: active ? "1px solid var(--accent-lime)" : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                      boxShadow: active ? "0 4px 14px rgba(200, 255, 69, 0.3)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: active ? "rgba(5, 8, 13, 0.2)" : "rgba(255, 255, 255, 0.08)",
                          color: active ? "#05080D" : "var(--accent-lime)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              fontSize: "11px",
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            Logged in as <strong style={{ color: "#F5F7FA" }}>Administrator</strong>
            <br />
            Database: <span style={{ color: "var(--accent-lime)" }}>Prisma PostgreSQL</span>
          </div>
        </aside>

        {/* Content View */}
        <main style={{ flex: 1, padding: "2.5rem 3rem", overflowY: "auto", background: "#05080D" }}>
          {activeSection === "profile" && <ProfileEditor />}
          {activeSection === "projects" && <ProjectsManager />}
          {activeSection === "skills" && <SkillsManager />}
          {activeSection === "tasks" && <TaskManager />}
          {activeSection === "friends" && <LeetCodeFriends />}
          {activeSection === "messages" && <MessagesInbox />}
          {activeSection === "vault" && <PersonalVault />}
          {activeSection === "inspector" && <DatabaseInspector />}
        </main>
      </div>
    </div>
  );
}
