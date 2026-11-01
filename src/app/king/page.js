"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileEditor from "../../components/king/ProfileEditor";
import ProjectsManager from "../../components/king/ProjectsManager";
import SkillsManager from "../../components/king/SkillsManager";
import ExperienceManager from "../../components/king/ExperienceManager";
import TaskManager from "../../components/king/TaskManager";
import LeetCodeFriends from "../../components/king/LeetCodeFriends";
import MessagesInbox from "../../components/king/MessagesInbox";
import PersonalVault from "../../components/king/PersonalVault";
import DatabaseInspector from "../../components/king/DatabaseInspector";
import { WebsiteLogoIcon } from "../../components/BrandIcons";
import {
  Crown,
  User,
  FolderGit2,
  Zap,
  Briefcase,
  Flame,
  Trophy,
  Mail,
  Lock,
  Database,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ShieldAlert,
  Layers,
} from "lucide-react";

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
    { id: "profile", label: "Profile & Hero Content", icon: User, badge: null, desc: "Portraits, bio & theme backgrounds" },
    { id: "projects", label: "Projects Manager", icon: FolderGit2, badge: stats.projects, desc: "Production projects & categories" },
    { id: "skills", label: "Skills & Tech Stack", icon: Zap, badge: null, desc: "Proficiency gauges & categories" },
    { id: "experience", label: "Experience & Roles", icon: Briefcase, badge: null, desc: "Internships & verified achievements" },
    { id: "tasks", label: "Streak Engine & Tasks", icon: Flame, badge: stats.tasks, desc: "Habits, Sunday points & task tracker" },
    { id: "friends", label: "LeetCode Rivalry Hub", icon: Trophy, badge: null, desc: "DSA battle rankings & stats" },
    { id: "messages", label: "Inquiries & Inbox", icon: Mail, badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : null, desc: "Encrypted messages received" },
    { id: "vault", label: "Personal Vault & Notes", icon: Lock, badge: stats.vaultNotes > 0 ? stats.vaultNotes : null, desc: "Private folder notes & scratchpad" },
    { id: "inspector", label: "Database Inspector", icon: Database, badge: "Live", desc: "Prisma PostgreSQL sync & schema" },
  ];

  // ─── 1. Login Screen ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-primary)",
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
            {theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
            <span>{theme === "electric-cyan" ? "Electric Cyan" : theme === "light" ? "Warm Amber" : "Cyber Dark"}</span>
          </button>
        </div>

        {/* Orbiting Cyber Ring 1 */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "2px dashed var(--accent-brand)",
            opacity: 0.35,
            boxShadow: "0 0 40px var(--accent-glow)",
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
            border: "1.5px solid var(--accent-secondary)",
            opacity: 0.3,
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
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Glowing Website Brand Logo Emblem */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(200, 255, 69, 0.15) 100%)",
              border: "1.5px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.4rem",
              boxShadow: "0 0 30px rgba(200, 255, 69, 0.25)",
              animation: "floatCrown 4s ease-in-out infinite",
            }}
          >
            <WebsiteLogoIcon size={42} />
          </div>

          <div className="section-tag" style={{ justifyContent: "center", marginBottom: 6 }}>
            Sanctuary Control
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
            Kings <span className="lime-underline">Deck</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
              marginBottom: "2rem",
              lineHeight: 1.5,
            }}
          >
            Encrypted Admin Sanctuary for Vivek Pawar. Full control over portraits, projects, habit streaks, and database vault.
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
                  background: "var(--input-bg)",
                  border: error ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  color: "var(--text-primary)",
                  fontSize: "1.05rem",
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  outline: "none",
                  fontFamily: "monospace",
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
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Crown size={16} />
              {loadingAuth ? "Validating Authorization..." : "Unlock Kings Deck"}
            </button>
          </form>

          <div style={{ marginTop: "1.8rem" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>←</span> Return to Public Website
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

  // ─── 2. Authenticated Kings Deck (Dual-Navbar: Top Telemetry + Left Navigation) ─
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Horizontal Telemetry & Status Bar ── */}
      <header
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          padding: "0.75rem 1.6rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
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
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <Link
            href="/"
            title="Return to Public Website"
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(200, 255, 69, 0.15) 100%)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(200, 255, 69, 0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <WebsiteLogoIcon size={26} />
          </Link>

          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Kings Deck
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  display: "inline-block",
                }}
              />
              Prisma PostgreSQL Online &bull; Latency {stats.latency}
            </div>
          </div>
        </div>

        {/* Right Actions: KPI Badges + Theme Switcher + View Site + Lock */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* KPI Badge: Projects */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Briefcase size={13} style={{ color: "var(--accent-brand)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Projects:</span>
            <span style={{ color: "var(--accent-brand)", fontWeight: 800 }}>{stats.projects}</span>
          </div>

          {/* KPI Badge: Tasks */}
          <div
            className="kpi-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Flame size={13} style={{ color: "var(--accent-highlight)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Tasks:</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 800 }}>{stats.tasks}</span>
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
              background: stats.unreadMessages > 0 ? "rgba(244, 63, 94, 0.12)" : "var(--bg-surface)",
              border: stats.unreadMessages > 0 ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Mail size={13} style={{ color: stats.unreadMessages > 0 ? "#f43f5e" : "var(--text-secondary)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Inbox:</span>
            <span style={{ color: stats.unreadMessages > 0 ? "#f43f5e" : "var(--text-primary)", fontWeight: 800 }}>
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} new` : stats.messages}
            </span>
          </div>

          {/* Theme Switcher Pill */}
          <button
            onClick={toggleTheme}
            type="button"
            title="Click to toggle theme"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 9999,
              background: "var(--badge-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-brand)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
            <span>{theme === "electric-cyan" ? "Electric Cyan" : theme === "light" ? "Warm Amber" : "Cyber Dark"}</span>
          </button>

          {/* View Public Portfolio CTA */}
          <Link
            href="/"
            className="btn-dark-pill"
            style={{ padding: "5px 14px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLink size={13} /> Public Site
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
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Lock size={12} /> Lock
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar Navigation + Workspace Pane ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left Sidebar Navigation */}
        <aside
          style={{
            width: isSidebarCollapsed ? 80 : 280,
            background: "var(--bg-card)",
            borderRight: "1px solid var(--border-subtle)",
            padding: "1.2rem 0.8rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
            transition: "width 0.22s ease",
            position: "relative",
          }}
          className={`king-sidebar ${mobileMenuOpen ? "king-mobile-open" : ""}`}
        >
          <div>
            {/* Collapse Toggle */}
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
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  DECK MODULES
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {/* Navigation Buttons List */}
            <nav style={{ display: "grid", gap: 5 }}>
              {navItems.map((item) => {
                const active = activeSection === item.id;
                const IconComponent = item.icon;
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
                      borderRadius: 10,
                      fontSize: "0.88rem",
                      fontWeight: active ? 800 : 600,
                      color: active ? "var(--text-on-accent)" : "var(--text-secondary)",
                      background: active ? "var(--accent-brand)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <IconComponent size={18} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: active ? "rgba(255, 255, 255, 0.25)" : "var(--bg-surface)",
                          color: active ? "var(--text-on-accent)" : "var(--accent-brand)",
                          border: active ? "none" : "1px solid var(--border-subtle)",
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
                <span style={{ color: "#22c55e", fontWeight: 700 }}>● Online</span>
              </div>
              <div>Admin: <strong style={{ color: "var(--text-primary)" }}>Vivek Pawar</strong></div>
              <div>Database: <span style={{ color: "var(--accent-brand)", fontWeight: 700 }}>PostgreSQL</span></div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <WebsiteLogoIcon size={24} />
            </div>
          )}
        </aside>

        {/* ── Main Workspace Content Area (Renders Active Module Cleanly) ── */}
        <main
          style={{
            flex: 1,
            padding: "2rem 2.5rem",
            overflowY: "auto",
            background: "var(--bg-primary)",
            position: "relative",
          }}
        >
          {activeSection === "profile" && <ProfileEditor />}
          {activeSection === "projects" && <ProjectsManager />}
          {activeSection === "skills" && <SkillsManager />}
          {activeSection === "experience" && <ExperienceManager />}
          {activeSection === "tasks" && <TaskManager />}
          {activeSection === "friends" && <LeetCodeFriends />}
          {activeSection === "messages" && <MessagesInbox />}
          {activeSection === "vault" && <PersonalVault />}
          {activeSection === "inspector" && <DatabaseInspector />}
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
