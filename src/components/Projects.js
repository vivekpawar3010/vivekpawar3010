"use client";

import { useState, useEffect, useMemo } from "react";
import defaultProjects from "../data/projects";
import ProjectDetailModal from "./ProjectDetailModal";
import {
  Lightbulb,
  FileCode2,
  Code2,
  CheckCircle2,
  Rocket,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function Projects() {
  const [projectsList, setProjectsList] = useState(defaultProjects);
  const [categoriesList, setCategoriesList] = useState(["All", "Full Stack", "AI & Web", "Frontend"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProjectModal, setActiveProjectModal] = useState(null);

  useEffect(() => {
    fetch("/api/king/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && Array.isArray(data.projects)) {
          setProjectsList(data.projects);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
      })
      .catch((err) => console.error("Error loading dynamic projects", err));
  }, []);

  // Compute categories dynamically if needed
  const availableCategories = useMemo(() => {
    const set = new Set(["All", ...categoriesList]);
    projectsList.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [categoriesList, projectsList]);

  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        selectedCategory === "All Projects" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

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
      desc: "Identify real-world problems and explore high-impact engineering solutions.",
      icon: Lightbulb,
      color: "#fbbf24",
    },
    {
      step: "2. Architecture",
      desc: "System design, database schemas, API specs, and choosing the optimal tech stack.",
      icon: FileCode2,
      color: "#38bdf8",
    },
    {
      step: "3. Sprint Dev",
      desc: "Agile build sprints, modular components, clean code, and microservice integration.",
      icon: Code2,
      color: "var(--accent-lime)",
    },
    {
      step: "4. Verification",
      desc: "Performance benchmarking, edge-case testing, security checks, and UX reviews.",
      icon: CheckCircle2,
      color: "#34d399",
    },
    {
      step: "5. Production",
      desc: "CI/CD deployment, edge caching, analytics monitoring, and continuous iteration.",
      icon: Rocket,
      color: "#c084fc",
    },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* ── 1. Projects Hero ── */}
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
          <div className="section-tag">
            <span className="handwritten" style={{ fontSize: "1.1rem", marginRight: 4 }}>✦</span> Featured Work
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.2rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Crafted with <span className="lime-underline">Purpose.</span>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 540,
              marginBottom: "2rem",
            }}
          >
            From AgriTech advisory and full-stack tourism portals to intelligent AI study engines and developer tools.
            Each project is built to solve actual problems.
          </p>
        </div>

        {/* Search & Category Filter Card */}
        <div
          className="glass-card"
          style={{
            padding: "1.8rem",
            borderRadius: 16,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Search Input with Vector Icon */}
          <div style={{ position: "relative", marginBottom: "1.2rem" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search projects by name, stack or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                borderRadius: 10,
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
                fontSize: "0.92rem",
                outline: "none",
              }}
            />
          </div>

          {/* Dynamic Admin-Managed Category Filter Bar */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={13} /> Filter By Domain:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {availableCategories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                const count =
                  cat === "All" || cat === "All Projects"
                    ? projectsList.length
                    : projectsList.filter((p) => p.category && p.category.toLowerCase() === cat.toLowerCase()).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    type="button"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "12px",
                      fontWeight: isSelected ? 800 : 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--accent-lime)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "var(--accent-lime)" : "var(--tag-bg)",
                      color: isSelected ? "var(--text-on-accent)" : "var(--text-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>{cat}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 5px",
                        borderRadius: 4,
                        background: isSelected ? "rgba(0, 0, 0, 0.2)" : "var(--badge-bg)",
                        color: isSelected ? "var(--text-on-accent)" : "var(--text-muted)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Clean Scannable Projects Grid (Click opens Modal) ── */}
      <div style={{ marginBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Showing {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}
          </h2>
          <span className="handwritten" style={{ fontSize: "1.15rem", color: "var(--accent-lime)" }}>
            Click any project to view full system architecture ⤷
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.8rem",
          }}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveProjectModal(project)}
              className="glass-card interactive-card"
              style={{
                padding: "1.6rem",
                borderRadius: 16,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 250,
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--accent-lime)";
                e.currentTarget.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                {/* Top row: Icon + Category Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
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
                        padding: "3px 9px",
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
                    fontSize: "1.25rem",
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
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {project.subtitle || project.description}
                </p>
              </div>

              {/* Card Footer: Tech tags + View Details CTA */}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "var(--accent-lime)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  View Details <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Project Development Process (From Idea to Impact) ── */}
      <section style={{ padding: "3rem 0 4rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-tag">
            <span className="handwritten" style={{ fontSize: "1.1rem", marginRight: 4 }}>✦</span> Engineering Lifecycle
          </div>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 900,
              margin: "0 0 8px",
              color: "var(--text-primary)",
            }}
          >
            From Idea to <span className="lime-underline">Impact.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: 640, fontSize: "0.95rem" }}>
            A structured, repeatable engineering workflow from architectural problem discovery to production deployment.
          </p>
        </div>

        {/* 5 Connected Process Steps with vector icons & connector line */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.2rem",
            position: "relative",
          }}
        >
          {devProcessSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  borderRadius: 14,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-card)",
                  position: "relative",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = step.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
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
                    color: step.color,
                    marginBottom: 12,
                  }}
                >
                  <StepIcon size={22} />
                </div>

                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
                  {step.step}
                </div>
                <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Bottom Callout Banner ── */}
      <div
        className="glass-card"
        style={{
          padding: "3.5rem 2rem",
          borderRadius: 20,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border-lime)",
          background: "var(--bg-card)",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            fontWeight: 900,
            marginBottom: "0.6rem",
            color: "var(--text-primary)",
          }}
        >
          Have a Project Idea in Mind?
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 540,
            margin: "0 auto 1.8rem",
            fontSize: "0.95rem",
          }}
        >
          Let&apos;s collaborate and turn that idea into a high-performance web or mobile product.
        </p>

        <a href="/contact" className="btn-lime">
          Let&apos;s Build Something <ArrowRight size={16} />
        </a>

        <div style={{ marginTop: 14 }}>
          <span className="handwritten" style={{ fontSize: "1.35rem", color: "var(--accent-lime)" }}>
            New Ideas Always Loading... ✦
          </span>
        </div>
      </div>

      {/* Popup Project Detail Modal */}
      {activeProjectModal && (
        <ProjectDetailModal
          project={activeProjectModal}
          onClose={() => setActiveProjectModal(null)}
        />
      )}
    </div>
  );
}
