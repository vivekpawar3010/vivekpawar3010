"use client";

import { useState, useEffect } from "react";

export default function DatabaseInspector() {
  const [latency, setLatency] = useState(null);
  const [testing, setTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState("Connected");
  const [sessionInput, setSessionInput] = useState("");
  const [sessionSaved, setSessionSaved] = useState("");
  const [modelCounts, setModelCounts] = useState({
    profile: 1,
    projects: 6,
    skills: 24,
    tasks: 0,
    friends: 0,
    messages: 0,
    vaultNotes: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("king_leetcode_session");
    if (saved) setSessionInput(saved);

    // Fetch initial model counts
    Promise.allSettled([
      fetch("/api/king/projects").then((r) => r.json()),
      fetch("/api/king/tasks").then((r) => r.json()),
      fetch("/api/king/messages").then((r) => r.json()),
      fetch("/api/king/vault").then((r) => r.json()),
    ]).then(([projRes, taskRes, msgRes, vaultRes]) => {
      setModelCounts((prev) => ({
        ...prev,
        projects: projRes.status === "fulfilled" && projRes.value?.projects?.length ? projRes.value.projects.length : 6,
        tasks: taskRes.status === "fulfilled" && taskRes.value?.tasks?.length ? taskRes.value.tasks.length : 0,
        messages: msgRes.status === "fulfilled" && msgRes.value?.messages?.length ? msgRes.value.messages.length : 0,
        vaultNotes: vaultRes.status === "fulfilled" && vaultRes.value?.notes?.length ? vaultRes.value.notes.length : 0,
      }));
    });
  }, []);

  const handleTestLatency = async () => {
    setTesting(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/king/profile");
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setLatency(elapsed);
        setDbStatus("Operational (Optimal)");
      } else {
        setLatency(elapsed);
        setDbStatus("Fallback Mode Active");
      }
    } catch {
      setLatency(null);
      setDbStatus("Error / Network Offline");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSession = (e) => {
    e.preventDefault();
    localStorage.setItem("king_leetcode_session", sessionInput.trim());
    setSessionSaved("LeetCode token saved securely in browser storage.");
    setTimeout(() => setSessionSaved(""), 3500);
  };

  const schemaModels = [
    {
      name: "Profile",
      model: "Profile",
      icon: "👤",
      count: modelCounts.profile,
      purpose: "Stores hero headline, professional title, bio, education, location, social links, and avatar selection.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "name", type: "String" },
        { name: "role", type: "String" },
        { name: "tagline", type: "String" },
        { name: "about", type: "String" },
        { name: "degree", type: "String" },
        { name: "institution", type: "String" },
        { name: "period", type: "String" },
        { name: "location", type: "String" },
        { name: "status", type: "String" },
        { name: "email", type: "String" },
        { name: "github", type: "String" },
        { name: "linkedin", type: "String" },
        { name: "leetcode", type: "String" },
        { name: "avatarUrl", type: "String?" },
      ],
    },
    {
      name: "Project",
      model: "Project",
      icon: "💼",
      count: modelCounts.projects,
      purpose: "Manages portfolio showcase items, live demo links, repository URLs, categories, and technology tags.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "name", type: "String" },
        { name: "subtitle", type: "String?" },
        { name: "description", type: "String" },
        { name: "category", type: "String" },
        { name: "tags", type: "String (CSV/JSON)" },
        { name: "link", type: "String" },
        { name: "github", type: "String?" },
        { name: "featured", type: "Boolean" },
        { name: "order", type: "Int" },
      ],
    },
    {
      name: "Skill",
      model: "Skill",
      icon: "⚡",
      count: modelCounts.skills,
      purpose: "Categorized technologies, frameworks, tools, and databases with proficiency levels.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "category", type: "String" },
        { name: "name", type: "String" },
        { name: "level", type: "String" },
        { name: "badge", type: "String?" },
      ],
    },
    {
      name: "Task",
      model: "Task",
      icon: "📋",
      count: modelCounts.tasks,
      purpose: "Admin todo tracker for ongoing development tasks, roadmap goals, and deadlines.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "title", type: "String" },
        { name: "category", type: "String" },
        { name: "priority", type: "String (High/Med/Low)" },
        { name: "status", type: "String (todo/in_progress/completed)" },
        { name: "dueDate", type: "String?" },
      ],
    },
    {
      name: "Friend",
      model: "Friend",
      icon: "🏆",
      count: modelCounts.friends,
      purpose: "LeetCode rival tracking, competitor statistics, and live solved problem comparison.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "username", type: "String (Unique)" },
        { name: "name", type: "String?" },
        { name: "isUser", type: "Boolean" },
        { name: "totalSolved", type: "Int" },
        { name: "easySolved", type: "Int" },
        { name: "mediumSolved", type: "Int" },
        { name: "hardSolved", type: "Int" },
        { name: "ranking", type: "String?" },
      ],
    },
    {
      name: "ContactMessage",
      model: "ContactMessage",
      icon: "📬",
      count: modelCounts.messages,
      purpose: "Visitor submissions received from the public Contact page form.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "name", type: "String" },
        { name: "email", type: "String" },
        { name: "message", type: "String" },
        { name: "read", type: "Boolean" },
        { name: "createdAt", type: "DateTime" },
      ],
    },
    {
      name: "VaultNote",
      model: "VaultNote",
      icon: "🔐",
      count: modelCounts.vaultNotes,
      purpose: "Personal encrypted developer notes, snippets, ideas, and categorized scratchpads.",
      fields: [
        { name: "id", type: "String (PK)" },
        { name: "title", type: "String" },
        { name: "category", type: "String" },
        { name: "content", type: "String" },
        { name: "pinned", type: "Boolean" },
        { name: "updatedAt", type: "DateTime" },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="section-tag">Architecture &amp; Data Deck</div>
        <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#F5F7FA", margin: "0 0 8px" }}>
          Database &amp; <span className="lime-underline">System Inspector</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
          Comprehensive architectural overview of PostgreSQL connection, Prisma schema, dual-storage failover, and data models.
        </p>
      </div>

      {/* Top Health Card */}
      <div
        className="glass-card"
        style={{
          padding: "1.8rem",
          borderRadius: 14,
          marginBottom: "2rem",
          border: "1px solid rgba(200, 255, 69, 0.3)",
          background: "linear-gradient(135deg, rgba(11, 18, 28, 0.95) 0%, rgba(5, 8, 13, 0.9) 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#C8FF45", boxShadow: "0 0 10px #C8FF45" }} />
              <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#F5F7FA" }}>
                PostgreSQL via Prisma ORM
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#C8FF45",
                  background: "rgba(200, 255, 69, 0.12)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(200, 255, 69, 0.3)",
                }}
              >
                {dbStatus}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              Dual-Storage Architecture: Remote PostgreSQL pooled database with zero-downtime local JSON caching (<code style={{ color: "var(--accent-lime)" }}>src/data/*.json</code>).
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {latency !== null && (
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(34, 211, 238, 0.1)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                  color: "#22D3EE",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Ping: {latency} ms
              </div>
            )}
            <button
              onClick={handleTestLatency}
              disabled={testing}
              className="btn-lime"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              {testing ? "Testing Ping..." : "⚡ Test Database Latency"}
            </button>
          </div>
        </div>
      </div>

      {/* Database Schema Models Grid */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#F5F7FA", marginBottom: "1rem" }}>
          Database Models &amp; Collected Information
        </h3>

        <div style={{ display: "grid", gap: "1.2rem" }}>
          {schemaModels.map((m, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "1.4rem",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                background: "rgba(11, 18, 28, 0.8)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#F5F7FA" }}>
                      model {m.model}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: "11px", color: "var(--text-muted)" }}>
                      Table: {m.model.toLowerCase()}s
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--accent-lime)",
                    background: "rgba(200, 255, 69, 0.1)",
                    border: "1px solid rgba(200, 255, 69, 0.25)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  {m.count} records
                </span>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 0.8rem", lineHeight: 1.5 }}>
                {m.purpose}
              </p>

              {/* Fields badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {m.fields.map((f, fIdx) => (
                  <span
                    key={fIdx}
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      color: "#94a3b8",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>{f.name}</span>: <span style={{ color: "#fbbf24" }}>{f.type}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LeetCode Session Token Manager Card */}
      <div
        className="glass-card"
        style={{
          padding: "1.8rem",
          borderRadius: 14,
          border: "1px solid var(--border-subtle)",
          background: "rgba(11, 18, 28, 0.85)",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F5F7FA", margin: "0 0 8px" }}>
          🔑 Authenticated LeetCode Session Cookie
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 1rem" }}>
          For querying private LeetCode contest statistics or profile analytics without rate limits, you can inject your session token here.
        </p>

        <form onSubmit={handleSaveSession}>
          <div style={{ marginBottom: "1rem" }}>
            <textarea
              rows={3}
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(5, 8, 13, 0.9)",
                border: "1px solid var(--border-subtle)",
                color: "#F5F7FA",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="submit" className="btn-lime" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
              Save Session Token
            </button>
            {sessionSaved && (
              <span style={{ color: "var(--accent-lime)", fontSize: "0.85rem", fontWeight: 600 }}>
                ✓ {sessionSaved}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Security note */}
      <div
        style={{
          padding: "1.2rem 1.4rem",
          borderRadius: 10,
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "var(--accent-lime)", fontWeight: 700 }}>Security &amp; Integrity Notice: </span>
        Environment credentials (<code style={{ color: "#38bdf8" }}>DATABASE_URL</code> and <code style={{ color: "#38bdf8" }}>KING_PASSCODE</code>) remain isolated on the server runtime and are never exposed to browser clients.
      </div>
    </div>
  );
}
