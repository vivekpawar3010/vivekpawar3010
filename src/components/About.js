"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";

export default function About() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading dynamic profile", err));
  }, []);
  const milestones = [
    {
      year: "2022",
      title: "Foundation & Core CS",
      desc: "Started B.Tech in Computer Science & Engineering at SVERI's College of Engineering. Mastered Object-Oriented Programming with Java and core computer science concepts.",
    },
    {
      year: "2023",
      title: "DSA & Android Development",
      desc: "Deep-dived into Data Structures & Algorithms and competitive problem solving. Built native Android apps integrated with Firebase authentication and real-time databases.",
    },
    {
      year: "2024",
      title: "Full-Stack Web & AI Projects",
      desc: "Expanded into modern web development with React, Next.js, and Node.js. Built real-world projects including Pandharpur Darshan and StudyBuddy AI.",
    },
    {
      year: "2025 - Present",
      title: "Advanced Systems & Daily Problem Solving",
      desc: "Engineering scalable web architectures, exploring AI integrations, maintaining an active LeetCode streak, and preparing for high-impact software engineering roles.",
    },
  ];

  const highlights = [
    { label: "Degree", value: profile.education.degree, icon: "🎓" },
    { label: "College", value: profile.education.institution, icon: "🏛️" },
    { label: "Graduation", value: profile.education.period, icon: "📅" },
    { label: "Location", value: profile.location, icon: "📍" },
  ];

  return (
    <div className="container" style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem 0 3rem" }}>
      {/* Header */}
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
          Get to Know Me
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
          About <span className="gradient-text">{profile.name}</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 650, margin: "0 auto", fontSize: "1.05rem" }}>
          {profile.tagline}
        </p>
      </div>

      {/* Grid: Bio & Quick Facts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Bio Card */}
        <div className="glass-card" style={{ padding: "1.8rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
            <span>👨‍💻</span> Background & Philosophy
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
            {profile.about}
          </p>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            I enjoy transforming intricate computational problems into sleek, robust, and intuitive user experiences.
            Whether architecting Next.js applications, building Android tools, or optimizing algorithms, I am focused on writing clean, scalable, and maintainable code.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.interests.map((interest, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "4px 10px",
                  color: "var(--text-secondary)",
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Education & Info Card */}
        <div className="glass-card" style={{ padding: "1.8rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: 10 }}>
            <span>🎓</span> Academic & Key Highlights
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {highlights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "12px 16px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>🚀</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>Current Objective</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Seeking Software Engineering Internships and Full-Time Roles.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
          My <span className="gradient-text">Journey & Milestones</span>
        </h2>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: "1.5rem",
                alignItems: "start",
                paddingBottom: idx !== milestones.length - 1 ? "1.5rem" : 0,
                borderBottom: idx !== milestones.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--accent-cyan)",
                  background: "rgba(56, 189, 248, 0.1)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                {milestone.year}
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", marginBottom: 6, color: "var(--text-primary)" }}>
                  {milestone.title}
                </h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  {milestone.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link href="/projects" className="btn-primary">
          Explore Projects 🚀
        </Link>
        <Link href="/leetcode" className="btn-secondary">
          LeetCode Analytics ⚡
        </Link>
        <Link href="/github" className="btn-secondary">
          GitHub Dashboard 🐙
        </Link>
        <Link href="/contact" className="btn-secondary">
          Get in Touch 📬
        </Link>
      </div>
    </div>
  );
}
