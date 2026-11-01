"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultExperience from "../data/experience.json";
import Skills from "./Skills";
import {
  Briefcase,
  Trophy,
  Zap,
  Cloud,
  Rocket,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  FileCheck2,
} from "lucide-react";

export default function Experience() {
  const [internships, setInternships] = useState(defaultExperience.internships);
  const [achievements, setAchievements] = useState(defaultExperience.achievements);
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    fetch("/api/king/experience")
      .then((res) => res.json())
      .then((data) => {
        if (data.internships && Array.isArray(data.internships)) {
          setInternships(data.internships);
        }
        if (data.achievements && Array.isArray(data.achievements)) {
          setAchievements(data.achievements);
        }
      })
      .catch((err) => console.error("Error loading dynamic experience data", err));
  }, []);

  return (
    <div className="container" style={{ maxWidth: 1140, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="section-tag" style={{ justifyContent: "center" }}>
          <span className="handwritten" style={{ fontSize: "1.1rem", marginRight: 4 }}>✦</span> Track Record &amp; Milestones
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            marginBottom: "0.75rem",
            fontWeight: 900,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Work <span className="lime-underline">Experience &amp; Expertise</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", fontSize: "1rem" }}>
          Industry engineering internships, verified career selections, technical certifications, and production skillsets.
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
          className="glass-card interactive-card"
          style={{
            padding: "1.5rem 1.8rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.08)",
            transition: "transform 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.borderColor = "#fbbf24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fbbf24",
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                LeetCode Custom Profile
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--accent-lime)", fontWeight: 700, marginTop: 2 }}>
                500+ Solved • Rating ~1718 • Badges &amp; Contests
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--accent-lime)" />
        </Link>

        {/* GitHub Custom Profile Card */}
        <Link
          href="/github"
          className="glass-card interactive-card"
          style={{
            padding: "1.5rem 1.8rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textDecoration: "none",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.08)",
            transition: "transform 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.borderColor = "#22D3EE";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(34, 211, 238, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22D3EE",
              }}
            >
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                GitHub Custom Profile
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--accent-lime)", fontWeight: 700, marginTop: 2 }}>
                Live Commits • Pull Requests • Repository Analytics
              </div>
            </div>
          </div>
          <ArrowRight size={18} color="var(--accent-lime)" />
        </Link>
      </div>

      {/* ── 1. Industry Internships Section (Connected Glowing Spine) ── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <Briefcase size={22} color="var(--accent-lime)" />
          <h2 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
            Industry <span style={{ color: "var(--accent-lime)" }}>Internships</span>
          </h2>
        </div>

        <div style={{ display: "grid", gap: "1.8rem", position: "relative" }}>
          {internships.map((internship, idx) => (
            <div
              key={internship.id || idx}
              className="glass-card"
              style={{
                padding: "2rem",
                borderRadius: 16,
                borderLeft: "4px solid var(--accent-lime)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "var(--accent-lime)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
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
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 10,
                        background: "rgba(200, 255, 69, 0.12)",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-lime)",
                      }}
                    >
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                        {internship.role}
                      </h3>
                      <div style={{ fontSize: "0.92rem", color: "var(--accent-lime)", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{internship.company}</span>
                        <span style={{ color: "var(--text-muted)" }}>•</span>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={13} /> {internship.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent-lime)",
                      background: "rgba(200, 255, 69, 0.12)",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(200, 255, 69, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Calendar size={13} /> {internship.period}
                  </span>

                  {internship.certificateUrl && (
                    <button
                      onClick={() => setSelectedProof(internship.certificateUrl)}
                      type="button"
                      style={{
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "var(--tag-bg)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <FileCheck2 size={13} color="var(--accent-lime)" /> View Proof
                    </button>
                  )}
                </div>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                {internship.description}
              </p>

              {/* Bullet Contributions */}
              {Array.isArray(internship.highlights) && internship.highlights.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.05em" }}>
                    Key Contributions &amp; Architectural Focus
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {internship.highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        <CheckCircle2 size={15} color="var(--accent-lime)" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Array.isArray(internship.tech) &&
                  internship.tech.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: "var(--tag-bg)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        padding: "3px 10px",
                        color: "var(--text-primary)",
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

      {/* ── 2. Career Achievements & Certifications (3D Tilt Cards) ── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
          <Trophy size={22} color="var(--accent-lime)" />
          <h2 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 900, color: "var(--text-primary)" }}>
            Career <span style={{ color: "var(--accent-lime)" }}>Achievements</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.4rem",
          }}
        >
          {achievements.map((item, idx) => (
            <div
              key={item.id || idx}
              className="glass-card"
              style={{
                padding: "1.6rem",
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-card)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 200,
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = item.color || "var(--accent-lime)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color || "var(--accent-lime)",
                    }}
                  >
                    {item.badge?.includes("7 LPA") ? (
                      <Rocket size={20} />
                    ) : item.badge?.includes("Google") ? (
                      <Cloud size={20} />
                    ) : item.badge?.includes("500+") ? (
                      <Zap size={20} />
                    ) : (
                      <Trophy size={20} />
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 6,
                      background: "var(--badge-bg)",
                      color: item.color || "var(--accent-lime)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.18rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: "0.85rem", color: item.color || "var(--accent-lime)", fontWeight: 700, marginBottom: 8 }}>
                  {item.subtitle}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {item.description}
                </p>
              </div>

              {item.credentialUrl && (
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent-lime)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Verify Credential <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Embedded Skills & Technical Arsenal Section (Granular Percentages) ── */}
      <div style={{ marginBottom: "3rem" }}>
        <Skills />
      </div>

      {/* ── 4. Quick Action Navigation ── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/projects" className="btn-lime">
          <Briefcase size={16} /> Explore Projects <ArrowRight size={15} />
        </Link>
        <Link href="/contact" className="btn-dark-pill">
          Get in Touch <ArrowRight size={15} />
        </Link>
      </div>

      {/* Lightbox Modal for Certificate / Proof */}
      {selectedProof && (
        <div
          onClick={() => setSelectedProof(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: 700,
              width: "100%",
              background: "var(--bg-card)",
              borderRadius: 16,
              padding: "1.5rem",
              border: "1px solid var(--border-light)",
            }}
          >
            <button
              onClick={() => setSelectedProof(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontWeight: 800 }}>Credential Verification Proof</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedProof} alt="Proof Certificate" style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: "70vh" }} />
          </div>
        </div>
      )}
    </div>
  );
}
