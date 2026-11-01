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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [avatarMode, setAvatarMode] = useState("real");
  const [stats, setStats] = useState({
    projects: 6,
    tasks: 0,
    messages: 0,
    unreadMessages: 0,
    vaultNotes: 0,
    dbStatus: "Online",
    latency: "~12ms",
  });

  // Sync theme from localStorage on mount & listen to changes
  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const savedAvatar = localStorage.getItem("portfolio_avatar_mode") || "real";
    setAvatarMode(savedAvatar);

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
        latency: "~14ms",
      });
    });
  }, [isAuthenticated]);

  const toggleTheme = () => {
    let next = "light";
    if (theme === "dark") next = "light";
    else if (theme === "light") next = "electric-cyan";
    else next = "dark";
    setTheme(next);
    localStorage.setItem("portfolio_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("themechange"));
  };

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

  const isLight = theme === "light" || theme === "electric-cyan" || theme === "warm-amber";

  // Navigation Items
  const navItems = [
    { id: "profile", label: "Profile & Hero Content", icon: "👤", badge: null, desc: "Personal bio, contact, and headline" },
    { id: "projects", label: "Projects Manager", icon: "💼", badge: stats.projects, desc: "Live production portfolio projects" },
    { id: "skills", label: "Skills & Tech Stack", icon: "⚡", badge: null, desc: "Languages, frameworks, and proficiencies" },
    { id: "tasks", label: "Daily Streaks & Tasks", icon: "🔥", badge: stats.tasks, desc: "Habit streaks, AI scores & general tasks" },
    { id: "friends", label: "LeetCode Rivalry Hub", icon: "🏆", badge: null, desc: "Friend rankings & DSA battle stats" },
    { id: "messages", label: "Inquiries & Inbox", icon: "📬", badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : null, desc: "Messages received from contact form" },
    { id: "vault", label: "Personal Vault & Notes", icon: "🔐", badge: stats.vaultNotes > 0 ? stats.vaultNotes : null, desc: "Private categorized folder notes" },
    { id: "inspector", label: "Database & Architecture", icon: "🗄️", badge: "Live", desc: "Prisma PostgreSQL sync & latency" },
  ];

  const currentNav = navItems.find((n) => n.id === activeSection) || navItems[0];

  // ─── 1. Login Screen (User-side Glassmorphism + Orbiting Rings + Theme Toggle) ───
  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-Right Theme Toggle Pill */}
        <div style={{ position: "absolute", top: 20, right: 24, zIndex: 10 }}>
          <button
            onClick={toggleTheme}
            type="button"
            className="btn-dark-pill"
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <span>{theme === "electric-cyan" ? "🌊 Electric Cyan" : theme === "light" ? "☀️ Warm Amber & Slate" : "🌙 Cyber Dark"}</span>
            <span style={{ fontSize: "10px", color: "var(--accent-brand)" }}>[Switch Theme]</span>
          </button>
        </div>

        {/* Orbiting Cyber Ring 1 (Background visual) */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: isLight ? "2px dashed rgba(255, 107, 0, 0.25)" : "2px dashed rgba(200, 255, 69, 0.25)",
            boxShadow: isLight ? "0 0 40px rgba(255, 107, 0, 0.12)" : "0 0 40px rgba(200, 255, 69, 0.15)",
            transform: "rotateX(68deg) rotateY(-18deg)",
            pointerEvents: "none",
            animation: "orbitSpin 22s linear infinite",
          }}
        />

        {/* Orbiting Cyber Ring 2 */}
        <div
          style={{
            position: "absolute",
            width: 580,
            height: 580,
            borderRadius: "50%",
            border: "1.5px solid rgba(2, 132, 199, 0.22)",
            transform: "rotateX(72deg) rotateY(24deg)",
            pointerEvents: "none",
            animation: "orbitSpinRev 18s linear infinite",
          }}
        />

        {/* Glassmorphic Login Card */}
        <div
          className="glass-card"
          style={{
            maxWidth: 450,
            width: "100%",
            padding: "2.8rem 2.2rem",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            borderRadius: 20,
          }}
        >
          {/* Glowing Crown Emblem with Pulse */}
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              background: isLight
                ? "linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%)"
                : "linear-gradient(135deg, rgba(200, 255, 69, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
              border: `1.5px solid ${isLight ? "var(--accent-orange)" : "var(--accent-lime)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              margin: "0 auto 1.4rem",
              boxShadow: isLight
                ? "0 0 30px rgba(255, 107, 0, 0.35)"
                : "0 0 30px rgba(200, 255, 69, 0.35)",
              animation: "floatCrown 4s ease-in-out infinite",
            }}
          >
            👑
          </div>

          <div className="section-tag" style={{ justifyContent: "center", marginBottom: 6 }}>
            Admin Sanctuary
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            King <span className="lime-underline">Deck</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
              marginBottom: "2rem",
              lineHeight: 1.5,
            }}
          >
            Private Command Hub for Vivek Pawar. Full encrypted control of projects, daily habit streaks, and personal vault.
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
                  background: isLight ? "#FFFFFF" : "rgba(5, 8, 13, 0.9)",
                  border: error
                    ? "1px solid #f43f5e"
                    : isLight
                    ? "1px solid rgba(249, 115, 22, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 12,
                  color: "var(--text-primary)",
                  fontSize: "1.05rem",
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                  boxShadow: isLight ? "0 2px 8px rgba(255, 107, 0, 0.08)" : "none",
                }}
              />
              {error && (
                <div style={{ color: "#fb7185", fontSize: "0.85rem", marginTop: 8, fontWeight: 600 }}>
                  ✕ {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingAuth}
              className="btn-lime"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "13px",
                fontSize: "0.95rem",
                fontWeight: 800,
              }}
            >
              {loadingAuth ? "Validating Authorization..." : "Unlock King Deck 👑"}
            </button>
          </form>

          <div style={{ marginTop: "1.8rem" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.88rem",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-lime)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <span>←</span> Return to Public Portfolio
            </Link>
          </div>
        </div>

        <style jsx>{`
          @keyframes orbitSpin {
            0% { transform: rotateX(68deg) rotateY(-18deg) rotateZ(0deg); }
            100% { transform: rotateX(68deg) rotateY(-18deg) rotateZ(360deg); }
          }
          @keyframes orbitSpinRev {
            0% { transform: rotateX(72deg) rotateY(24deg) rotateZ(360deg); }
            100% { transform: rotateX(72deg) rotateY(24deg) rotateZ(0deg); }
          }
          @keyframes floatCrown {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
      </main>
    );
  }

  // ─── 2. Authenticated King Dashboard (Ultra-Crisp User-Side UI + Light/Dark Mode) ───
  return (
    <div
      style={{
        minHeight: "calc(100vh - 68px)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ── Top Executive KPI & Database Strip ── */}
      <header
        style={{
          background: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(11, 18, 28, 0.95)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          padding: "0.75rem 1.6rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: isLight ? "0 4px 20px rgba(249, 115, 22, 0.05)" : "none",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left Brand Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="king-mobile-nav-toggle"
            aria-label="Toggle Navigation"
            style={{
              display: "none",
              padding: "6px 10px",
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: isLight
                ? "linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%)"
                : "linear-gradient(135deg, rgba(200, 255, 69, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
              border: `1px solid ${isLight ? "var(--accent-orange)" : "var(--accent-lime)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: isLight ? "0 0 15px rgba(255, 107, 0, 0.25)" : "0 0 15px rgba(200, 255, 69, 0.25)",
            }}
          >
            👑
          </div>

          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
              King Sanctuary
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isLight ? "#16A34A" : "#C8FF45",
                  boxShadow: isLight ? "0 0 6px #16A34A" : "0 0 6px #C8FF45",
                  display: "inline-block",
                }}
              />
              Prisma PostgreSQL Synced &bull; Latency {stats.latency}
            </div>
          </div>
        </div>

        {/* Right Actions: KPI Badges + Admin Avatar Control + Theme Switcher + Lock */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Admin Exclusive Avatar Control */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Active Avatar:</span>
            <button
              type="button"
              onClick={() => {
                const next = avatarMode === "real" ? "rocklee" : "real";
                setAvatarMode(next);
                localStorage.setItem("portfolio_avatar_mode", next);
                window.dispatchEvent(new CustomEvent("portfolio_avatar_changed", { detail: { mode: next } }));
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                color: "var(--accent-brand)",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
              title="Only Admin controls the active public avatar"
            >
              <span>{avatarMode === "real" ? "👤 Vivek Real Cutout" : "🍃 Rock Lee"}</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>[Swap]</span>
            </button>
          </div>
          {/* KPI Badge: Projects */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>💼 Projects:</span>
            <span style={{ color: "var(--accent-brand)", fontWeight: 800 }}>{stats.projects}</span>
          </div>

          {/* KPI Badge: Tasks & Streaks */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>🔥 Tasks:</span>
            <span style={{ color: "var(--accent-cyan)", fontWeight: 800 }}>{stats.tasks}</span>
          </div>

          {/* KPI Badge: Messages Inbox */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: stats.unreadMessages > 0 ? "rgba(244, 63, 94, 0.12)" : "var(--bg-card)",
              border: stats.unreadMessages > 0 ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>📬 Inbox:</span>
            <span style={{ color: stats.unreadMessages > 0 ? "#f43f5e" : "var(--text-primary)", fontWeight: 800 }}>
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : stats.messages}
            </span>
          </div>

          {/* Master Theme Switcher Pill */}
          <button
            onClick={toggleTheme}
            type="button"
            title="Click to switch theme: Warm Amber -> Electric Cyan -> Cyber Dark"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 9999,
              background: "var(--tag-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-brand)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>{theme === "electric-cyan" ? "🌊 Electric Cyan" : theme === "light" ? "☀️ Warm Amber" : "🌙 Cyber Dark"}</span>
          </button>

          {/* View Public Portfolio CTA */}
          <Link
            href="/"
            className="btn-dark-pill"
            style={{ padding: "5px 14px", fontSize: "12px", fontWeight: 700 }}
          >
            <span>🌐</span> Portfolio
          </Link>

          {/* Lock Admin Session */}
          <button
            onClick={handleLogout}
            type="button"
            title="Lock Admin Control Session"
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              color: "#fb7185",
              padding: "5px 12px",
              borderRadius: 9999,
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244, 63, 94, 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)")}
          >
            Lock 🔒
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar + Content Area ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar Navigation */}
        <aside
          style={{
            width: isSidebarCollapsed ? 80 : 290,
            background: isLight ? "rgba(255, 255, 255, 0.98)" : "rgba(10, 16, 24, 0.98)",
            borderRight: "1px solid var(--border-subtle)",
            padding: "1.4rem 0.9rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
            transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative",
          }}
          className={`king-sidebar ${mobileMenuOpen ? "king-mobile-open" : ""}`}
        >
          <div>
            {/* Navigation Header with Collapse Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isSidebarCollapsed ? "center" : "space-between",
                padding: "0 8px 12px",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: 12,
              }}
            >
              {!isSidebarCollapsed && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "var(--text-muted)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Workspace Control
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar to Compact Mode"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-lime)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {isSidebarCollapsed ? "⇥" : "⇤ Collapse"}
              </button>
            </div>

            {/* Navigation Buttons List */}
            <nav style={{ display: "grid", gap: 6 }}>
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    title={isSidebarCollapsed ? `${item.label} (${item.desc})` : item.desc}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isSidebarCollapsed ? "center" : "space-between",
                      width: "100%",
                      padding: isSidebarCollapsed ? "12px 0" : "10px 14px",
                      borderRadius: 12,
                      fontSize: "0.88rem",
                      fontWeight: active ? 800 : 500,
                      color: active ? "var(--text-on-accent)" : "var(--text-secondary)",
                      background: active ? "var(--accent-brand)" : "transparent",
                      border: active ? "1px solid var(--accent-brand)" : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                      boxShadow: active ? "0 4px 16px var(--accent-glow)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "var(--tag-bg)";
                        e.currentTarget.style.color = "var(--text-primary)";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: active
                            ? "rgba(255, 255, 255, 0.25)"
                            : "var(--tag-bg)",
                          color: active
                            ? "var(--text-on-accent)"
                            : "var(--accent-brand)",
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

          {/* Bottom Environment & Database Summary Card */}
          {!isSidebarCollapsed ? (
            <div
              className="glass-card"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: "11px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                marginTop: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>Active Session</span>
                <span style={{ color: isLight ? "#16A34A" : "var(--accent-lime)", fontWeight: 700 }}>● Online</span>
              </div>
              <div>Admin: <strong style={{ color: "var(--text-primary)" }}>Vivek Pawar</strong></div>
              <div>Database: <span style={{ color: "var(--accent-brand)", fontWeight: 700 }}>Prisma PostgreSQL</span></div>
              <div style={{ color: "var(--text-muted)", marginTop: 4 }}>Theme: {theme === "electric-cyan" ? "Modern Slate & Electric Cyan" : theme === "light" ? "Warm Amber & Slate" : "Cyber Dark"}</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", fontSize: 18, color: "var(--text-muted)", padding: "10px 0" }}>
              👑
            </div>
          )}
        </aside>

        {/* ── Main Executive Content Workspace ── */}
        <main
          style={{
            flex: 1,
            padding: "2rem 2.5rem",
            overflowY: "auto",
            background: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            position: "relative",
          }}
        >
          {/* Section Breadcrumb & Header Hero Banner */}
          <div
            className="glass-card"
            style={{
              padding: "1.4rem 1.8rem",
              borderRadius: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div className="section-tag" style={{ marginBottom: 4 }}>
                {currentNav.icon} King Deck &bull; {currentNav.label}
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  margin: "0 0 4px",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {currentNav.label}
              </h2>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                {currentNav.desc}
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setActiveSection("tasks")}
                className="btn-dark-pill"
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderColor: activeSection === "tasks" ? "var(--accent-lime)" : "var(--border-subtle)",
                }}
              >
                <span>🔥</span> Daily Streaks
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("vault")}
                className="btn-dark-pill"
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderColor: activeSection === "vault" ? "var(--accent-lime)" : "var(--border-subtle)",
                }}
              >
                <span>🔐</span> Vault Folders
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("inspector")}
                className="btn-dark-pill"
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderColor: activeSection === "inspector" ? "var(--accent-lime)" : "var(--border-subtle)",
                }}
              >
                <span>🗄️</span> DB Status
              </button>
            </div>
          </div>

          {/* Active Section Content Mount */}
          <div style={{ flex: 1 }}>
            {activeSection === "profile" && <ProfileEditor />}
            {activeSection === "projects" && <ProjectsManager />}
            {activeSection === "skills" && <SkillsManager />}
            {activeSection === "tasks" && <TaskManager />}
            {activeSection === "friends" && <LeetCodeFriends />}
            {activeSection === "messages" && <MessagesInbox />}
            {activeSection === "vault" && <PersonalVault />}
            {activeSection === "inspector" && <DatabaseInspector />}
          </div>
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .king-mobile-nav-toggle {
            display: inline-flex !important;
          }
          .kpi-chip {
            display: none !important;
          }
          .king-sidebar {
            position: fixed !important;
            top: 60px;
            bottom: 0;
            left: -320px;
            z-index: 50;
            width: 280px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            transition: left 0.3s ease !important;
          }
          .king-sidebar.king-mobile-open {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
