"use client";

import Link from "next/link";

export default function StatsStrip() {
  const stats = [
    {
      value: "500+",
      label: "LeetCode Problems",
      icon: "⚡",
      color: "var(--accent-lime)",
      href: "/leetcode",
    },
    {
      value: "9.21",
      label: "CGPA (B.Tech CSE)",
      icon: "🎓",
      color: "#38bdf8",
      href: "/about",
    },
    {
      value: "4+",
      label: "Major Projects",
      icon: "💼",
      color: "#818cf8",
      href: "/projects",
    },
    {
      value: "2",
      label: "AI Integrations",
      icon: "🤖",
      color: "#c084fc",
      href: "/projects",
    },
    {
      value: "∞",
      label: "Learning & Building",
      icon: "♾️",
      color: "#34d399",
      href: "/about",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.2rem",
        alignItems: "stretch",
      }}
    >
      {/* 5 Stats Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.85rem",
          gridColumn: "span 2",
        }}
      >
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="glass-card interactive-card"
            style={{
              padding: "1.1rem 1.2rem",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              background: "rgba(11, 18, 28, 0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{stat.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: stat.color,
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                Verified
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 900,
                  color: "#F5F7FA",
                  lineHeight: 1.1,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Currently Working On Status Card (From Image 1) */}
      <div
        className="glass-card"
        style={{
          padding: "1.2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 12,
          border: "1px solid var(--border-subtle)",
          background: "rgba(11, 18, 28, 0.9)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span
            className="animate-pulse-green"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent-lime)",
            }}
          />
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-lime)", letterSpacing: "0.06em" }}>
            Currently working on
          </span>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <Link
            href="/projects"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.88rem",
              color: "#F5F7FA",
              fontWeight: 600,
              textDecoration: "none",
              padding: "4px 0",
            }}
          >
            <span>🌱 StudyBuddy — AI Study Platform</span>
            <span style={{ color: "var(--accent-lime)" }}>→</span>
          </Link>
          <Link
            href="/experience"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              textDecoration: "none",
              padding: "4px 0",
            }}
          >
            <span>🌐 Exploring Java Spring Boot</span>
            <span style={{ color: "var(--accent-lime)" }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
