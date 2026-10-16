"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";
import TiltCard from "./TiltCard";

export default function Hero() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading dynamic profile", err));
  }, []);
  return (
    <section style={{ padding: "4rem 0 3rem" }}>
      <div className="container" style={{ textAlign: "center", maxWidth: 900 }}>
        {/* Availability Badge */}
        <div style={{ marginBottom: "1.5rem" }} className="animate-float">
          <span
            className="glow-neon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              padding: "7px 18px",
              borderRadius: 30,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            />
            {profile.status}
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "1.2rem",
            letterSpacing: "-0.03em",
          }}
        >
          Hi, I&apos;m <span className="gradient-text">{profile.name}</span>
        </h1>

        {/* Subheading / Role */}
        <h2
          style={{
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            fontWeight: 600,
            color: "var(--accent-cyan)",
            marginBottom: "1.2rem",
          }}
        >
          {profile.role}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "var(--text-secondary)",
            maxWidth: 720,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Final-year CSE student at SVERI&apos;s College of Engineering. Building high-performance full-stack web applications, native Android experiences, and daily algorithmic problem solving.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "3.5rem",
          }}
        >
          <Link href="/projects" className="btn-primary">
            <span>🚀</span> View Projects
          </Link>
          <Link href="/leetcode" className="btn-secondary">
            <span>⚡</span> LeetCode Analytics
          </Link>
          <Link href="/github" className="btn-secondary">
            <span>🐙</span> GitHub Stats
          </Link>
          <Link href="/contact" className="btn-secondary">
            <span>📬</span> Contact Me
          </Link>
        </div>

        {/* Quick Highlights Row with 3D TiltCards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.2rem",
            textAlign: "left",
          }}
        >
          <TiltCard style={{ padding: "1.4rem" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💡</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Primary Stack
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
              Java, React, Next.js & Android
            </div>
          </TiltCard>

          <TiltCard style={{ padding: "1.4rem" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Algorithmic Problem Solving
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
              DSA & Daily LeetCode Practice
            </div>
          </TiltCard>

          <TiltCard style={{ padding: "1.4rem" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎓</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Education
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
              B.Tech CSE (2022–2026)
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}

