"use client";

import { useEffect } from "react";
import { X, ExternalLink, CheckCircle2, Layers, Cpu, AlertCircle, Sparkles } from "lucide-react";
import { GithubIcon as Github } from "./BrandIcons";

export default function ProjectDetailModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const hasLiveUrl = Boolean(project.liveUrl && project.liveUrl !== project.github && project.liveUrl !== project.githubUrl);
  const githubLink = project.githubUrl || project.github || project.link;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(5, 8, 13, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 20,
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px var(--badge-bg)",
          padding: "2rem",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--tag-bg)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--accent-lime)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "var(--tag-bg)",
              border: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              color: "var(--accent-lime)",
              flexShrink: 0,
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

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {project.category && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "var(--badge-bg)",
                    color: "var(--accent-lime)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {project.category}
                </span>
              )}
              <span style={{ fontSize: "11px", color: "var(--accent-secondary)", fontWeight: 700 }}>
                ● Verified Production App
              </span>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>
              {project.name}
            </h2>
          </div>
        </div>

        {/* Subtitle / Tagline */}
        <p style={{ fontSize: "1.02rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {project.subtitle || project.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.8rem" }}>
          {Array.isArray(project.tags) &&
            project.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--tag-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Problem Statement & Solution Grid */}
        {(project.problem || project.solution) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
              marginBottom: "1.8rem",
            }}
          >
            {project.problem && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  background: "var(--tag-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#f43f5e", fontWeight: 700, fontSize: "0.88rem" }}>
                  <AlertCircle size={15} /> The Problem
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {project.problem}
                </p>
              </div>
            )}

            {project.solution && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  background: "var(--tag-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--accent-lime)", fontWeight: 700, fontSize: "0.88rem" }}>
                  <Sparkles size={15} /> The Engineering Solution
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {project.solution}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Key Features Bullet List */}
        {Array.isArray(project.keyFeatures) && project.keyFeatures.length > 0 && (
          <div style={{ marginBottom: "1.8rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Layers size={16} color="var(--accent-lime)" /> Key Engineering Highlights
            </h4>
            <div style={{ display: "grid", gap: 8 }}>
              {project.keyFeatures.map((feat, fIdx) => (
                <div key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  <CheckCircle2 size={16} color="var(--accent-lime)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Details */}
        {project.architecture && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--input-bg)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "1.8rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Cpu size={18} color="#38bdf8" />
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Architecture:</strong> {project.architecture}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
          {hasLiveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-lime"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>Live Application</span>
              <ExternalLink size={16} />
            </a>
          )}

          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noreferrer"
              className="btn-dark-pill"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Github size={16} />
              <span>GitHub Repository</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
