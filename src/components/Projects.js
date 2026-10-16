"use client";

import { useState, useEffect } from "react";
import defaultProjects from "../data/projects";

export default function Projects() {
  const [projectsList, setProjectsList] = useState(defaultProjects);
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const categories = ["All", "Full Stack", "AI & Web", "Frontend"];

  const filteredProjects =
    selectedCategory === "All"
      ? projectsList
      : projectsList.filter((p) => p.category === selectedCategory);

  return (
    <section style={{ padding: "1rem 0 3rem" }}>
      {/* Category Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: "2.5rem",
          justifyContent: "center",
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                border: isSelected ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                background: isSelected ? "rgba(56, 189, 248, 0.15)" : "var(--badge-bg)",
                color: isSelected ? "var(--accent-cyan)" : "var(--text-secondary)",
                transition: "all var(--transition-fast)",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.8rem",
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id || project.name}
            className="glass-card"
            style={{
              padding: "1.8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--accent-cyan)",
                    background: "rgba(56, 189, 248, 0.12)",
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  {project.category}
                </span>
                {project.featured && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fbbf24",
                      background: "rgba(245, 158, 11, 0.12)",
                      padding: "3px 8px",
                      borderRadius: 6,
                    }}
                  >
                    ★ Featured
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
                {project.name}
              </h3>
              {project.subtitle && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12, fontWeight: 500 }}>
                  {project.subtitle}
                </div>
              )}

              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                {project.description}
              </p>

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div style={{ marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Key Highlights
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    {project.highlights.map((h, hIdx) => (
                      <li key={hIdx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.5rem" }}>
                {project.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "var(--badge-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center", fontSize: "0.88rem", padding: "8px 14px" }}
              >
                <span>🚀</span> View Project
              </a>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: "0.88rem", padding: "8px 12px" }}
                  title="GitHub Repository"
                >
                  <span>🐙</span> Code
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
