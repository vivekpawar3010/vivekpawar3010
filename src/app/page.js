"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Skills from "../components/Skills";
import defaultProjects from "../data/projects";

export default function Home() {
  const [projectsList, setProjectsList] = useState(defaultProjects);

  useEffect(() => {
    fetch("/api/king/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && Array.isArray(data.projects)) {
          setProjectsList(data.projects);
        }
      })
      .catch((err) => console.error("Error loading dynamic projects", err));
  }, []);

  const featuredProjects = projectsList.filter((p) => p.featured).slice(0, 3);

  return (
    <main>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Interactive Analytics Teaser Section */}
      <section style={{ padding: "3rem 0", background: "rgba(15, 23, 42, 0.4)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent-cyan)",
                background: "rgba(56, 189, 248, 0.1)",
                padding: "4px 14px",
                borderRadius: 20,
                border: "1px solid rgba(56, 189, 248, 0.25)",
                marginBottom: 12,
              }}
            >
              Real-Time Activity
            </span>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>
              Live Developer <span className="gradient-text">Analytics</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 620, margin: "0 auto", fontSize: "1rem" }}>
              Directly synced with official LeetCode and GitHub GraphQL APIs with sub-second caching.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* LeetCode Teaser Card */}
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>⚡</span>
                    <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 700 }}>LeetCode Analytics</h3>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#60a5fa",
                      background: "rgba(59, 130, 246, 0.15)",
                      padding: "3px 10px",
                      borderRadius: 12,
                    }}
                  >
                    Live GraphQL
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  Live problem-solving statistics, difficulty breakdown (Easy / Medium / Hard), global ranking, contest ratings, and recent acceptance submissions.
                </p>
              </div>
              <Link href="/leetcode" className="btn-primary" style={{ width: "fit-content" }}>
                Launch LeetCode Dashboard →
              </Link>
            </div>

            {/* GitHub Teaser Card */}
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>🐙</span>
                    <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 700 }}>GitHub Dashboard</h3>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#34d399",
                      background: "rgba(16, 185, 129, 0.15)",
                      padding: "3px 10px",
                      borderRadius: 12,
                    }}
                  >
                    Live REST + GraphQL
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  Live contribution calendar, commits, pull requests, top starred repositories, and automated language composition analysis.
                </p>
              </div>
              <Link href="/github" className="btn-emerald" style={{ width: "fit-content" }}>
                Launch GitHub Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skills Section */}
      <Skills />

      {/* 4. Featured Projects Preview */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent-cyan)",
                  background: "rgba(56, 189, 248, 0.1)",
                  padding: "4px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  marginBottom: 8,
                }}
              >
                Work Showcase
              </span>
              <h2 style={{ fontSize: "2.2rem", margin: 0 }}>
                Featured <span className="gradient-text">Projects</span>
              </h2>
            </div>
            <Link href="/projects" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
              View All Projects →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="glass-card"
                style={{
                  padding: "1.8rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--accent-cyan)",
                        background: "rgba(56, 189, 248, 0.12)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {project.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>{project.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                    {project.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.5rem" }}>
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-subtle)",
                          color: "#cbd5e1",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ fontSize: "0.85rem", padding: "8px 14px", flex: 1, justifyContent: "center" }}
                  >
                    View Project ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section style={{ padding: "3rem 0 5rem" }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: 24,
            }}
          >
            <h2 style={{ fontSize: "2.2rem", marginBottom: "0.8rem" }}>
              Interested in <span className="gradient-text">Collaborating?</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: 580,
                margin: "0 auto 2rem",
                fontSize: "1.05rem",
              }}
            >
              I am actively looking for software engineering internship and full-time opportunities. Let&apos;s build impactful software together.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary" style={{ padding: "12px 24px", fontSize: "1rem" }}>
                Get In Touch 📬
              </Link>
              <Link href="/about" className="btn-secondary" style={{ padding: "12px 24px", fontSize: "1rem" }}>
                Learn More About Me 👨‍💻
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
