"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import StatsStrip from "../components/StatsStrip";
import defaultProjects from "../data/projects";

export default function Home() {
  const [projectsList, setProjectsList] = useState(defaultProjects);
  const [isJupiterHovered, setIsJupiterHovered] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    fetch("/api/king/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && Array.isArray(data.projects)) {
          setProjectsList(data.projects);
        }
      })
      .catch((err) => console.error("Error loading dynamic projects", err));

    const handleJupiterHover = (e) => {
      setIsJupiterHovered(Boolean(e.detail?.hovering));
    };
    const updateTheme = () => {
      const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(activeTheme);
    };
    updateTheme();

    window.addEventListener("jupiter_hover", handleJupiterHover);
    window.addEventListener("themechange", updateTheme);
    return () => {
      window.removeEventListener("jupiter_hover", handleJupiterHover);
      window.removeEventListener("themechange", updateTheme);
    };
  }, []);

  const themeBgMap = {
    dark: "/images/bg-theme-1.jpg",
    light: "/images/bg-theme-2.jpg",
    "warm-amber": "/images/bg-theme-2.jpg",
    "electric-cyan": "/images/bg-theme-3.jpg",
  };
  const activeBgImage = themeBgMap[theme] || themeBgMap.dark;

  // Deduplicate projects so each project appears only once
  const uniqueProjects = Array.from(
    new Map(projectsList.map((p) => [p.name.toLowerCase().trim(), p])).values()
  );
  const featuredProjects = uniqueProjects.slice(0, 4);

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
    <main style={{ position: "relative" }}>
      {/* Dynamic Theme Background Portrait (Revealed on 3D Jupiter Hover with Enhanced Visibility & Downward Positioning) */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-70px",
          bottom: "-70px",
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: isJupiterHovered ? 0.88 : 0,
          transform: isJupiterHovered ? "scale(1.03) translateY(55px)" : "scale(1) translateY(0)",
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundImage: `radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.28) 60%, rgba(5, 8, 13, 0.88) 100%), url(${activeBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 38%",
          backgroundRepeat: "no-repeat",
        }}
      />
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
            {featuredProjects.map((project) => {
              const targetUrl =
                project.liveUrl || project.link || project.githubUrl || project.github || "/projects";
              const isExternal = targetUrl.startsWith("http");

              return (
                <Link
                  key={project.id}
                  href={targetUrl}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="glass-card interactive-card"
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    textDecoration: "none",
                    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                    minHeight: 200,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    {/* Top row: Project Icon / Logo + Category Badge */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: "var(--tag-bg)",
                          border: "1px solid var(--border-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          color: "var(--accent-lime)",
                        }}
                      >
                        {project.id === "pandharpurdarshan"
                          ? "🏛️"
                          : project.id === "studybuddy-ai"
                          ? "🤖"
                          : project.id === "agromitra-ai"
                          ? "🌱"
                          : project.id === "krishi-connect"
                          ? "🌾"
                          : project.id === "genzday"
                          ? "✨"
                          : "👑"}
                      </div>

                      {project.category && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "var(--badge-bg)",
                            color: "var(--accent-lime)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {project.category}
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        margin: "0 0 6px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {project.name}
                    </h3>

                    {/* Concise 1-2 line description */}
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {project.subtitle || project.description}
                    </p>
                  </div>

                  {/* Card Footer: Top Tech tags + Single Arrow CTA */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Array.isArray(project.tags) &&
                        project.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--tag-bg)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--accent-lime)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      Visit ↗
                    </span>
                  </div>
                </Link>
              );
            })}
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
