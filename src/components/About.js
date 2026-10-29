"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";
import { useAvatarMode } from "../lib/useAvatarMode";

export default function About() {
  const [profile, setProfile] = useState(defaultProfile);
  const { currentSrc, toggleAvatarMode, isRockLee } = useAvatarMode(profile?.avatarUrl);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error("Error loading dynamic profile in About", err));
  }, []);

  const aboutStats = [
    { value: "500+", label: "LeetCode Problems", icon: "⚡" },
    { value: "9.21", label: "CGPA (B.Tech CSE)", icon: "🎓" },
    { value: "4+", label: "Major Projects", icon: "💼" },
    { value: "2", label: "AI Integrations", icon: "🤖" },
    { value: "36", label: "Contests Attended", icon: "📊" },
    { value: "9", label: "LeetCode Badges", icon: "🏆" },
  ];

  const milestones = [
    {
      year: "2022",
      title: "Started B.Tech in CSE",
      desc: "Began my journey at SVERI's COE, Pandharpur.",
      icon: "🎓",
    },
    {
      year: "2023",
      title: "Explored Web & App Development",
      desc: "Learned Java, JavaScript, React and Android development.",
      icon: "💻",
    },
    {
      year: "2024",
      title: "Front-End Development Internship",
      desc: "1-month internship at Micro IT. Mentored by Vijay Kumar.",
      icon: "💼",
    },
    {
      year: "2024",
      title: "Google Cloud Certifications",
      desc: "Completed Introduction to Responsible AI and Introduction to LLMs.",
      icon: "☁️",
    },
    {
      year: "2025",
      title: "Led SPIRIT 2K25 (Registration Head)",
      desc: "Managed 500–600 registrations across 6 events with a team of 12 members.",
      icon: "👥",
    },
    {
      year: "2025",
      title: "Selected for TCS Digital",
      desc: "Got selected for TCS Digital with a ₹7 LPA package.",
      icon: "🏆",
    },
    {
      year: "2026",
      title: "Graduated",
      desc: "Completed B.Tech in Computer Science and Engineering with 9.21 CGPA.",
      icon: "✅",
    },
  ];

  const interests = [
    {
      title: "AI & Machine Learning",
      desc: "Exploring AI to build intelligent solutions.",
      icon: "🤖",
    },
    {
      title: "EdTech",
      desc: "Building tools that make learning better.",
      icon: "📖",
    },
    {
      title: "AgriTech",
      desc: "Using technology for a better and greener future.",
      icon: "🌱",
    },
    {
      title: "Travel & Maps",
      desc: "Love exploring places and building travel tools.",
      icon: "📍",
    },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* 1. Hero / Introduction (Image 2) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          alignItems: "center",
          marginBottom: "3.5rem",
        }}
      >
        {/* Left: Bio & Heading */}
        <div>
          <div className="section-tag">About Me</div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.2rem",
              color: "#F5F7FA",
              letterSpacing: "-0.02em",
            }}
          >
            More than just a <br />
            <span className="lime-underline">Developer.</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              marginBottom: "1.8rem",
            }}
          >
            I&apos;m Vivek Pawar, a Software Developer and Computer Science graduate who loves building real-world products, solving problems, and exploring new technologies. I enjoy turning ideas into useful, impactful applications whether it&apos;s for travel, education, agriculture or beyond.
          </p>

          {/* Social Links Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href="https://github.com/vivekpawar3010"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                🐙
              </a>
              <a
                href="https://linkedin.com/in/vivek-pawar-16548a275"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                in
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                title="Twitter"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                𝕏
              </a>
              <a
                href="mailto:vivekpawar3010@gmail.com"
                title="Email"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                ✉️
              </a>
              <a
                href="https://instagram.com/vivek.pawar.dev"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                📸
              </a>
              <Link
                href="/leetcode"
                title="LeetCode"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(11, 18, 28, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                ⚡
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="handwritten" style={{ fontSize: "1.3rem" }}>
                Let&apos;s connect!
              </span>
              <span style={{ color: "var(--accent-lime)", fontSize: "1.1rem" }}>⤷</span>
            </div>
          </div>
        </div>

        {/* Right: Portrait with Glowing Halo + Badges + Code Card */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Circular Portrait with Floating Badges */}
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <div
              onClick={toggleAvatarMode}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                padding: 3,
                background: "linear-gradient(135deg, var(--accent-lime) 0%, #22D3EE 100%)",
                boxShadow: "0 0 35px rgba(200, 255, 69, 0.4)",
                cursor: "pointer",
                position: "relative",
              }}
              title="Click to toggle avatar (Vivek 👤 ↔ Rock Lee 🍃)"
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#05080D",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSrc}
                  alt="Vivek Pawar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/avatar.png";
                  }}
                />
              </div>
            </div>

            {/* Floating Badge: Problem Solver */}
            <div
              style={{
                position: "absolute",
                top: -8,
                left: -35,
                background: "rgba(11, 18, 28, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#F5F7FA",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ color: "var(--accent-lime)" }}>&lt;/&gt;</span> Problem Solver
            </div>

            {/* Floating Badge: Always Learning */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: -30,
                background: "rgba(11, 18, 28, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#F5F7FA",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>🎓</span> Always Learning
            </div>

            {/* Floating Badge: Building Real Products */}
            <div
              style={{
                position: "absolute",
                bottom: 35,
                right: -45,
                background: "rgba(11, 18, 28, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#F5F7FA",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>📦</span> Building Real Products
            </div>
          </div>

          {/* Code Card: // vivek.js */}
          <div
            style={{
              width: "min(280px, 90vw)",
              background: "rgba(11, 18, 28, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              padding: "12px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>// vivek.js</div>
            <div>
              <span style={{ color: "#a855f7" }}>const</span>{" "}
              <span style={{ color: "var(--accent-lime)" }}>vivek</span> = &#123;
            </div>
            <div style={{ paddingLeft: 10 }}>
              <span style={{ color: "#38bdf8" }}>role</span>: <span style={{ color: "#fbbf24" }}>&quot;Software Developer&quot;</span>,
            </div>
            <div style={{ paddingLeft: 10 }}>
              <span style={{ color: "#38bdf8" }}>location</span>: <span style={{ color: "#fbbf24" }}>&quot;Pandharpur, India&quot;</span>,
            </div>
            <div style={{ paddingLeft: 10 }}>
              <span style={{ color: "#38bdf8" }}>education</span>: <span style={{ color: "#fbbf24" }}>&quot;B.Tech CSE (Graduate)&quot;</span>,
            </div>
            <div style={{ paddingLeft: 10 }}>
              <span style={{ color: "#38bdf8" }}>passionateAbout</span>: [
            </div>
            <div style={{ paddingLeft: 20, color: "#fbbf24" }}>
              &quot;Web Development&quot;,<br />
              &quot;AI & Real World Products&quot;,<br />
              &quot;EdTech&quot;,<br />
              &quot;AgriTech&quot;
            </div>
            <div style={{ paddingLeft: 10 }}>],</div>
            <div style={{ paddingLeft: 10 }}>
              <span style={{ color: "#38bdf8" }}>motto</span>: <span style={{ color: "var(--accent-lime)" }}>&quot;Build. Learn. Improve.&quot;</span>
            </div>
            <div>&#125;;</div>
          </div>
        </div>
      </div>

      {/* 2. Stats Strip (Image 2) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "3.5rem",
        }}
      >
        {aboutStats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: "1.1rem 1.2rem",
              borderRadius: 12,
              background: "rgba(11, 18, 28, 0.8)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
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
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Two Columns: Education & Journey (Left) vs Interests & Certifications (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Academic Journey + Timeline + Quote Card */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Education Card */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div className="section-tag">Education</div>
              <span style={{ fontSize: "12px", color: "var(--accent-lime)", fontWeight: 700 }}>
                View Details →
              </span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              My Academic Journey
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              A strong foundation in Computer Science and Engineering that shaped my technical and problem-solving skills.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(11, 18, 28, 0.9) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                🏛️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F5F7FA" }}>
                  B.Tech in Computer Science and Engineering
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  Punyashlok Ahilyadevi Holkar University <br />
                  (SVERI&apos;s College of Engineering, Pandharpur)
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                  2022 - 2026
                </div>
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--accent-lime)",
                  background: "rgba(200, 255, 69, 0.1)",
                  color: "var(--accent-lime)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                CGPA <br />
                <span style={{ fontSize: "1rem" }}>9.21 / 10</span>
              </div>
            </div>
          </div>

          {/* From Curiosity to Creation Timeline (Image 2) */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">My Journey</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              From Curiosity to Creation
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>
              A timeline of key moments, experiences, and milestones that shaped my journey.
            </p>

            <div style={{ display: "grid", gap: "1.2rem", position: "relative", paddingLeft: 8 }}>
              {/* Vertical connecting line */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: 15,
                  bottom: 20,
                  width: 2,
                  background: "linear-gradient(180deg, var(--accent-lime) 0%, #22D3EE 100%)",
                }}
              />

              {milestones.map((item, idx) => (
                <div
                  key={idx}
                  className="interactive-card"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    position: "relative",
                    zIndex: 1,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {/* Node icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#05080D",
                      border: "2px solid var(--accent-lime)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "var(--accent-lime)",
                            background: "rgba(200, 255, 69, 0.1)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {item.year}
                        </span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F5F7FA" }}>
                          {item.title}
                        </span>
                      </div>
                      <span className="card-hint-badge">Details <span>↓</span></span>
                    </div>
                    {/* Progressive disclosure description */}
                    <div className="hover-reveal-content">
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pandharpur Quote Card with Temple Silhouette Background */}
          <div
            className="glass-card"
            style={{
              padding: "2rem",
              borderRadius: 14,
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "linear-gradient(180deg, rgba(11, 18, 28, 0.7) 0%, rgba(5, 8, 13, 0.95) 100%)",
            }}
          >
            <div style={{ fontSize: 32, color: "var(--accent-lime)", lineHeight: 1, marginBottom: 8 }}>“</div>
            <p
              style={{
                fontSize: "1.02rem",
                color: "#F5F7FA",
                fontWeight: 600,
                lineHeight: 1.6,
                margin: "0 0 1rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              I believe in using technology to create meaningful solutions that solve real-world problems.
            </p>
            <div style={{ fontSize: "0.85rem", color: "var(--accent-lime)", fontWeight: 700 }}>
              — Vivek Pawar
            </div>
          </div>
        </div>

        {/* Right Column: Interests + Certifications + Beyond Code */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Interests Section */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">Interests</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              Things I&apos;m Passionate About
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              Technologies and domains that excite me and where I want to create real impact.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {interests.map((item, idx) => (
                <div
                  key={idx}
                  className="interactive-card"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <span className="card-hint-badge">Explore <span>→</span></span>
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>{item.title}</div>
                  <div className="hover-reveal-content">
                    <div style={{ fontSize: "0.8rem", color: "var(--accent-lime)", marginTop: 4, lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Achievements Section */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <div className="section-tag">Certifications</div>
              <Link href="/experience" style={{ fontSize: "12px", color: "var(--accent-lime)", fontWeight: 700 }}>
                View All Achievements →
              </Link>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              Certifications & Achievements
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              Some of the key certifications and achievements that validate my skills and learning journey.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              {/* Google Cloud Resp AI */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>☁️</span>
                  <div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      Introduction to Responsible AI
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Google Cloud Skills Boost • Mar 2024
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)", fontSize: "14px" }}>↗</span>
              </div>

              {/* Google Cloud LLMs */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>☁️</span>
                  <div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      Introduction to Large Language Models
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Google Cloud Skills Boost • Mar 2024
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)", fontSize: "14px" }}>↗</span>
              </div>
            </div>
          </div>

          {/* Beyond Code (Image 2) */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">Beyond Code</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              A Bit About Me
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              When I&apos;m not coding, you&apos;ll probably find me exploring new places, learning something new, or working on creative ideas.
            </p>

            {/* Hobbies Icons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.2rem" }}>
              {[
                { label: "Fitness", icon: "🏋️" },
                { label: "Travel", icon: "✈️" },
                { label: "Music", icon: "🎧" },
                { label: "Games", icon: "🎮" },
                { label: "Reading", icon: "📚" },
              ].map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12px",
                    color: "#F5F7FA",
                  }}
                >
                  <span>{h.icon}</span>
                  <span>{h.label}</span>
                </div>
              ))}
            </div>

            {/* Code Box: const life = { ... } */}
            <div
              style={{
                background: "rgba(5, 8, 13, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              <div>
                <span style={{ color: "#a855f7" }}>const</span>{" "}
                <span style={{ color: "var(--accent-lime)" }}>life</span> = &#123;
              </div>
              <div style={{ paddingLeft: 12, color: "#38bdf8" }}>learn: <span style={{ color: "var(--accent-lime)" }}>true</span>,</div>
              <div style={{ paddingLeft: 12, color: "#38bdf8" }}>explore: <span style={{ color: "var(--accent-lime)" }}>true</span>,</div>
              <div style={{ paddingLeft: 12, color: "#38bdf8" }}>build: <span style={{ color: "var(--accent-lime)" }}>true</span>,</div>
              <div style={{ paddingLeft: 12, color: "#38bdf8" }}>repeat: <span style={{ color: "var(--accent-lime)" }}>true</span></div>
              <div>&#125;;</div>
            </div>

            <div style={{ textAlign: "right", marginTop: 8 }}>
              <span className="handwritten" style={{ fontSize: "1.15rem" }}>
                Same curiosity in life as in code!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
