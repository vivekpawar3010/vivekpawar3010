"use client";

import { useState, useEffect, useMemo } from "react";
import defaultProjects from "../data/projects";

export default function Projects() {
  const [projectsList, setProjectsList] = useState(defaultProjects);
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");

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

  const categories = [
    "All Projects",
    "Web Applications",
    "Mobile Apps",
    "AI / ML",
    "Blockchain",
    "Open Source",
  ];

  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesCategory =
        selectedCategory === "All Projects" ||
        p.category === selectedCategory ||
        (selectedCategory === "Open Source" && p.category === "Open Source");

      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesQuery;
    });
  }, [projectsList, selectedCategory, searchQuery]);

  const devProcessSteps = [
    {
      step: "1. Ideation",
      desc: "Identify real world problems and explore solutions.",
      icon: "💡",
    },
    {
      step: "2. Planning",
      desc: "Research, choose tech stack and design architecture.",
      icon: "📄",
    },
    {
      step: "3. Development",
      desc: "Build, implement features and iterate constantly.",
      icon: "💻",
    },
    {
      step: "4. Testing",
      desc: "Test for performance, security and user experience.",
      icon: "✅",
    },
    {
      step: "5. Deployment",
      desc: "Deploy and share with the world for real impact.",
      icon: "🚀",
    },
  ];

  return (
    <div>
      {/* 1. Projects Hero (Image 3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          alignItems: "center",
          marginBottom: "3.5rem",
        }}
      >
        <div>
          <div className="section-tag">Projects</div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.2rem",
              color: "#F5F7FA",
              letterSpacing: "-0.02em",
            }}
          >
            Ideas to <br />
            Real <span className="lime-underline">Products.</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: "2rem",
            }}
          >
            A collection of projects where I explored ideas, learned new technologies, and built useful solutions for real world problems.
          </p>

          {/* Quick Metrics Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { val: "4+", label: "Major Projects", icon: "💼" },
              { val: "2", label: "Open Source", icon: "🌐" },
              { val: "10+", label: "Technologies", icon: "⚡" },
              { val: "∞", label: "Learning & Improving", icon: "♾️" },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  color: "#F5F7FA",
                }}
              >
                <span style={{ color: "var(--accent-lime)", fontWeight: 800 }}>{m.val}</span>
                <span style={{ color: "var(--text-secondary)" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating Laptop Graphic / Terminal Panel */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="glass-card"
            style={{
              width: "min(380px, 90vw)",
              borderRadius: "14px",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              background: "rgba(11, 18, 28, 0.95)",
              overflow: "hidden",
              boxShadow: "0 20px 45px rgba(0,0,0,0.7), 0 0 25px rgba(34, 211, 238, 0.15)",
            }}
          >
            <div
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f43f5e" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                portfolio_standards.sh
              </span>
            </div>

            <div style={{ padding: "16px 18px", fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.8 }}>
              <div style={{ color: "var(--accent-lime)" }}>&gt; Real World Projects</div>
              <div style={{ color: "#38bdf8" }}>&gt; Open Source Contributions</div>
              <div style={{ color: "#F5F7FA" }}>&gt; Modern Tech Stack</div>
              <div style={{ color: "#F5F7FA" }}>&gt; Clean &amp; Scalable Code</div>
              <div style={{ color: "#fbbf24" }}>&gt; Continuous Learning</div>
              <div style={{ color: "var(--accent-lime)" }}>&gt; Building for Impact</div>
            </div>

            <div style={{ padding: "8px 18px 14px", textAlign: "right" }}>
              <span className="handwritten" style={{ fontSize: "1.2rem" }}>
                Build Learn Improve Repeat.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar (Image 3) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem",
        }}
      >
        {/* Category Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 800 : 500,
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--accent-lime)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "var(--accent-lime)" : "rgba(11, 18, 28, 0.7)",
                  color: isSelected ? "#05080D" : "var(--text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: 240, flex: "0 1 300px" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: "9999px",
              fontSize: "0.85rem",
              background: "rgba(11, 18, 28, 0.8)",
              border: "1px solid var(--border-subtle)",
              color: "#F5F7FA",
            }}
          />
        </div>
      </div>

      {/* 3. Responsive Project Grid (6 cards matching Image 3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.8rem",
          marginBottom: "4rem",
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id || project.name}
            className="glass-card interactive-card"
            style={{
              padding: "1.4rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 14,
              border: "1px solid var(--border-subtle)",
              background: "rgba(11, 18, 28, 0.85)",
              cursor: "pointer",
            }}
          >
            <div>
              {/* Preview Banner */}
              <div
                style={{
                  width: "100%",
                  height: 170,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(11, 18, 28, 0.95) 100%)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "1rem",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 40, opacity: 0.85 }}>
                  {project.id === "pandharpurdarshan"
                    ? "🏛️"
                    : project.id === "studybuddy-ai"
                    ? "📚"
                    : project.id === "nextgenhire"
                    ? "💼"
                    : project.id === "chainride"
                    ? "🚗"
                    : project.id === "ecommerce-handmade"
                    ? "🛍️"
                    : "🤖"}
                </span>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(5, 8, 13, 0.8)",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#F5F7FA",
                  }}
                >
                  ↗
                </a>
                {project.category && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(5, 8, 13, 0.85)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--accent-lime)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {project.category}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#F5F7FA" }}>
                  {project.name}
                </h3>
                <span className="card-hint-badge">
                  Hover for details <span>↓</span>
                </span>
              </div>

              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {project.subtitle || project.description.slice(0, 80) + "..."}
              </div>

              {/* Progressive Disclosure on Hover */}
              <div className="hover-reveal-content">
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "0.85rem",
                    lineHeight: 1.55,
                    margin: 0,
                    padding: "8px 10px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderLeft: "2px solid var(--accent-lime)",
                    borderRadius: "0 6px 6px 0",
                  }}
                >
                  {project.description}
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "0.8rem", marginBottom: "0.5rem" }}>
                  {(Array.isArray(project.tags)
                    ? project.tags
                    : typeof project.tags === "string"
                    ? project.tags.split(",")
                    : []
                  ).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {typeof tag === "string" ? tag.trim() : tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Live Demo (Lime) & GitHub (Dark) */}
            <div style={{ display: "flex", gap: 10, marginTop: "1.2rem" }}>
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="btn-lime"
                style={{ flex: 1, padding: "8px 14px", fontSize: "0.85rem" }}
              >
                Live Demo <span>→</span>
              </a>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-dark-pill"
                  style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                  title="GitHub Repository"
                >
                  🐙 GitHub <span>→</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Project Development Process (Image 3) */}
      <section style={{ padding: "3rem 0 4rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-tag">Project Development Process</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  margin: "0 0 8px",
                  color: "#F5F7FA",
                }}
              >
                From Idea to <span className="lime-underline">Impact.</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: 640, fontSize: "0.95rem" }}>
                Each project goes through a structured process from research and planning to development, testing and deployment.
              </p>
            </div>
            <button
              onClick={() => alert("Structured engineering workflow: Discovery & Problem Identification -> Architectural Blueprint & Tech Choices -> Agile Sprint Development -> Automated & Regression Testing -> Continuous Production Deployment.")}
              className="btn-lime"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              View My Process <span>→</span>
            </button>
          </div>
        </div>

        {/* 5 Connected Process Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {devProcessSteps.map((step, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "1.4rem",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                background: "rgba(11, 18, 28, 0.8)",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#F5F7FA", marginBottom: 4 }}>
                {step.step}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom Horizon Banner: More projects coming soon... (Image 3) */}
      <div
        className="glass-card"
        style={{
          padding: "3.5rem 2rem",
          borderRadius: 20,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          background: "radial-gradient(circle at 50% 120%, rgba(34, 211, 238, 0.3) 0%, rgba(200, 255, 69, 0.15) 35%, rgba(11, 18, 28, 0.95) 75%)",
          marginBottom: "3rem",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 900,
            marginBottom: "0.6rem",
            color: "#F5F7FA",
          }}
        >
          More projects coming soon...
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 540,
            margin: "0 auto 1.8rem",
            fontSize: "0.95rem",
          }}
        >
          I&apos;m always working on new ideas and exploring new technologies. Stay tuned for more exciting projects!
        </p>

        <a href="/contact" className="btn-lime">
          Let&apos;s Build Something <span>→</span>
        </a>

        <div style={{ marginTop: 12 }}>
          <span className="handwritten" style={{ fontSize: "1.25rem" }}>
            New Ideas Always Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
