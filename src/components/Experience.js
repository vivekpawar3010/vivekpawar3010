"use client";

import Link from "next/link";
import { internships, achievements } from "../data/experience";
import Skills from "./Skills";

export default function Experience() {
  return (
    <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="section-tag" style={{ justifyContent: "center" }}>
          Track Record &amp; Milestones
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            marginBottom: "0.75rem",
            fontWeight: 900,
            color: "#F5F7FA",
            letterSpacing: "-0.02em",
          }}
        >
          Work <span className="lime-underline">Experience &amp; Expertise</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", fontSize: "1rem" }}>
          Industry internships, engineering achievements, technical skillsets, and verified career milestones.
        </p>
      </div>

      {/* ── Custom Profiles Quick Bar (LeetCode & GitHub) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.2rem",
          marginBottom: "3.5rem",
        }}
      >
        {/* LeetCode Custom Profile Card */}
        <Link
          href="/leetcode"
          className="glass-card"
          style={{
            padding: "1.5rem 1.8rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "radial-gradient(circle at 100% 50%, rgba(245, 158, 11, 0.12) 0%, rgba(11, 18, 28, 0.95) 70%)",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>⚡</span>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F5F7FA" }}>
                LeetCode Custom Profile
              </div>
              <div style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 600, marginTop: 2 }}>
                500+ Solved • Rating ~1718 • Badges &amp; Contests
              </div>
            </div>
          </div>
          <span style={{ color: "#fbbf24", fontSize: 18, fontWeight: 800 }}>→</span>
        </Link>

        {/* GitHub Custom Profile Card */}
        <Link
          href="/github"
          className="glass-card"
          style={{
            padding: "1.5rem 1.8rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            border: "1px solid rgba(34, 211, 238, 0.35)",
            background: "radial-gradient(circle at 100% 50%, rgba(34, 211, 238, 0.12) 0%, rgba(11, 18, 28, 0.95) 70%)",
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>🐙</span>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F5F7FA" }}>
                GitHub Custom Profile
              </div>
              <div style={{ fontSize: "0.82rem", color: "#22D3EE", fontWeight: 600, marginTop: 2 }}>
                Live Commits • Pull Requests • Repository Analytics
              </div>
            </div>
          </div>
          <span style={{ color: "#22D3EE", fontSize: 18, fontWeight: 800 }}>→</span>
        </Link>
      </div>

      {/* ── 1. Internships Section ── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <span style={{ fontSize: 24 }}>💼</span>
          <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 800, color: "#F5F7FA" }}>
            Industry <span style={{ color: "var(--accent-lime)" }}>Internships</span>
          </h2>
        </div>

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="glass-card"
              style={{
                padding: "2rem",
                borderRadius: 14,
                borderLeft: "4px solid var(--accent-lime)",
                background: "rgba(11, 18, 28, 0.85)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "rgba(200, 255, 69, 0.15)",
                        border: "1px solid rgba(200, 255, 69, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      {internship.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 800, color: "#F5F7FA" }}>
                        {internship.role}
                      </h3>
                      <div style={{ fontSize: "0.92rem", color: "#22D3EE", fontWeight: 600 }}>
                        {internship.company} · {internship.location}
                      </div>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--accent-lime)",
                    background: "rgba(200, 255, 69, 0.12)",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(200, 255, 69, 0.3)",
                  }}
                >
                  {internship.period}
                </span>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                {internship.description}
              </p>

              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                  Key Contributions
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {internship.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {internship.tech.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 6,
                      padding: "3px 10px",
                      color: "#F5F7FA",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Technical Achievements & Certifications ── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <span style={{ fontSize: 24 }}>🏆</span>
          <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 800, color: "#F5F7FA" }}>
            Career <span style={{ color: "var(--accent-lime)" }}>Achievements</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {achievements.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: "1.6rem",
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                background: "rgba(11, 18, 28, 0.85)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(200, 255, 69, 0.15)",
                    color: "var(--accent-lime)",
                    border: "1px solid rgba(200, 255, 69, 0.3)",
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 4px", color: "#F5F7FA" }}>
                {item.title}
              </h3>
              <div style={{ fontSize: "0.85rem", color: "#22D3EE", fontWeight: 600, marginBottom: 8 }}>
                {item.subtitle}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Embedded Skills & Technical Arsenal Section ── */}
      <div style={{ marginBottom: "3rem" }}>
        <Skills />
      </div>

      {/* ── 4. Quick Action Navigation ── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/projects" className="btn-lime">
          Explore Projects <span>→</span>
        </Link>
        <Link href="/contact" className="btn-dark-pill">
          Get in Touch ✉️
        </Link>
      </div>
    </div>
  );
}
