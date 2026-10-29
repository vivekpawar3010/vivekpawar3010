"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import StatsStrip from "../components/StatsStrip";
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

  const featuredProjects = projectsList.slice(0, 4);

  const technologies = [
    { name: "Java", icon: "☕" },
    { name: "JavaScript", icon: "🟨" },
    { name: "Python", icon: "🐍" },
    { name: "React", icon: "⚛️" },
    { name: "Next.js", icon: "▲" },
    { name: "Spring Boot", icon: "🍃" },
    { name: "Firebase", icon: "🔥" },
    { name: "PostgreSQL", icon: "🐘" },
    { name: "MongoDB", icon: "🍃" },
    { name: "Tailwind CSS", icon: "🌊" },
    { name: "Gemini API", icon: "✨" },
  ];

  const whyIBuild = [
    {
      title: "Problem Solving",
      desc: "Turn complex problems into simple solutions.",
      icon: "🛡️",
    },
    {
      title: "Continuous Learning",
      desc: "Always exploring new technologies.",
      icon: "🎯",
    },
    {
      title: "Real World Impact",
      desc: "Build products that solve real problems.",
      icon: "🌱",
    },
    {
      title: "Collaboration",
      desc: "Love working with amazing people.",
      icon: "🤝",
    },
  ];

  const recentAchievements = [
    {
      title: "TCS Digital",
      subtitle: "Selected | 7 LPA",
      icon: "💼",
    },
    {
      title: "Google Cloud",
      subtitle: "2 Certifications",
      icon: "☁️",
    },
    {
      title: "Frontend Intern",
      subtitle: "Micro IT (1 month)",
      icon: "💻",
    },
    {
      title: "Event Leader",
      subtitle: "SPIRIT 2K25",
      icon: "🏆",
    },
    {
      title: "500+ Problems",
      subtitle: "LeetCode Milestone",
      icon: "⚡",
    },
  ];

  return (
    <main>
      {/* 1. Hero Section (Image 1) */}
      <Hero />

      {/* 2. Technologies I Work With Strip */}
      <section style={{ padding: "1.5rem 0 2.5rem" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.2rem",
            }}
          >
            <div className="section-tag section-tag-cyan">Technologies I Work With</div>
            <Link
              href="/experience"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent-lime)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View Skills &amp; Experience <span>→</span>
            </Link>
          </div>

          {/* Infinite Smooth Flowing Tech Marquee */}
          <div className="marquee-container" style={{ padding: "6px 0 12px" }}>
            <div className="marquee-track">
              {[...technologies, ...technologies].map((tech, idx) => (
                <div key={idx} className="tech-chip">
                  <span>{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              ))}
              <Link
                href="/experience"
                style={{
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  background: "rgba(200, 255, 69, 0.12)",
                  border: "1px solid rgba(200, 255, 69, 0.4)",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "var(--accent-lime)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                + explore all
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Stats Strip */}
      <section style={{ padding: "0 0 4rem" }}>
        <div className="container">
          <StatsStrip />
        </div>
      </section>

      {/* 4. Featured Projects Section */}
      <section style={{ padding: "3rem 0 4rem" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div className="section-tag">Featured Projects</div>
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  margin: "0 0 8px",
                  color: "#F5F7FA",
                  letterSpacing: "-0.02em",
                }}
              >
                Some things <span className="lime-underline">I&apos;ve built.</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: 600, fontSize: "0.95rem" }}>
                A collection of projects where I explored ideas, learned new technologies and built useful solutions for real world problems.
              </p>
            </div>

            <Link
              href="/projects"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--accent-lime)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              View All Projects <span>→</span>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {featuredProjects.map((project) => (
              <div
                key={project.id}
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
                  {/* Mock Screenshot Banner */}
                  <div
                    style={{
                      width: "100%",
                      height: 160,
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
                    <span style={{ fontSize: 36, opacity: 0.85 }}>
                      {project.id === "pandharpurdarshan"
                        ? "🏛️"
                        : project.id === "studybuddy-ai"
                        ? "📚"
                        : project.id === "nextgenhire"
                        ? "💼"
                        : "🚗"}
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
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        margin: 0,
                        color: "#F5F7FA",
                      }}
                    >
                      {project.name}
                    </h3>
                    <span className="card-hint-badge">
                      Hover for details <span>↓</span>
                    </span>
                  </div>

                  {/* Clean Initial Subtitle */}
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.88rem",
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {project.subtitle || project.description.slice(0, 75) + "..."}
                  </div>

                  {/* Progressive Disclosure: Full details revealed on hover */}
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
                      {project.tags.map((tag, tIdx) => (
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
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buttons: Live Demo (Lime) & GitHub (Dark) */}
                <div style={{ display: "flex", gap: 10, marginTop: "1.2rem" }}>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-lime"
                    style={{
                      flex: 1,
                      padding: "8px 14px",
                      fontSize: "0.85rem",
                    }}
                  >
                    Live Demo
                  </a>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-dark-pill"
                      style={{
                        padding: "8px 14px",
                        fontSize: "0.85rem",
                      }}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why I Build Section (Image 1) */}
      <section style={{ padding: "3rem 0 4rem" }}>
        <div className="container">
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="section-tag">Why I Build</div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 900,
                margin: "0 0 8px",
                color: "#F5F7FA",
                letterSpacing: "-0.02em",
              }}
            >
              More than just <span className="lime-underline">code.</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: 640, fontSize: "0.95rem" }}>
              I enjoy solving real world problems, learning new technologies and building products that create a positive impact.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {whyIBuild.map((item, idx) => (
              <div
                key={idx}
                className="glass-card interactive-card"
                style={{
                  padding: "1.4rem",
                  borderRadius: 14,
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(11, 18, 28, 0.8)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <span className="card-hint-badge">Explore <span>→</span></span>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px", color: "#F5F7FA" }}>
                  {item.title}
                </h3>
                {/* Progressive disclosure on hover */}
                <div className="hover-reveal-content">
                  <p style={{ fontSize: "0.85rem", color: "var(--accent-lime)", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Recent Achievements & Milestones (Image 1) */}
      <section style={{ padding: "2rem 0 4rem" }}>
        <div className="container">
          <div style={{ marginBottom: "2rem" }}>
            <div className="section-tag">Recent Achievements</div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                fontWeight: 900,
                margin: 0,
                color: "#F5F7FA",
              }}
            >
              Achievements & Milestones
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {recentAchievements.map((item, idx) => (
              <div
                key={idx}
                className="glass-card interactive-card"
                style={{
                  padding: "1.2rem 1.4rem",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(11, 18, 28, 0.85)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F5F7FA" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bottom Earth Horizon CTA (Image 1) */}
      <section style={{ padding: "4rem 0 5rem" }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "4rem 2rem",
              borderRadius: 24,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              background: "radial-gradient(circle at 50% 120%, rgba(34, 211, 238, 0.3) 0%, rgba(200, 255, 69, 0.15) 35%, rgba(11, 18, 28, 0.95) 75%)",
              boxShadow: "0 0 80px rgba(34, 211, 238, 0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
                fontWeight: 900,
                marginBottom: "0.8rem",
                color: "#F5F7FA",
                letterSpacing: "-0.02em",
              }}
            >
              Let&apos;s build something amazing <span className="lime-underline">together.</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: 580,
                margin: "0 auto 2.2rem",
                fontSize: "1.05rem",
                lineHeight: 1.6,
              }}
            >
              I&apos;m always open to new opportunities, interesting projects and meaningful collaborations.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Link href="/contact" className="btn-lime">
                Get In Touch <span>→</span>
              </Link>
              <a
                href="https://drive.google.com/file/d/1X5X9kC5d7eL3yZk_example/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="btn-dark-pill"
              >
                <span>📥</span> Download Resume
              </a>
            </div>

            {/* Handwritten note: Open for Opportunities! */}
            <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
              <span className="handwritten" style={{ fontSize: "1.3rem" }}>
                Open for Opportunities!
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
