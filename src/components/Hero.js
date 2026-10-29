"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";
import GreenJupiterPlanet from "./GreenJupiterPlanet";

export default function Hero() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading profile in Hero", err));
  }, []);

  return (
    <section style={{ padding: "3.5rem 0 3rem", position: "relative", overflow: "hidden" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          {/* Left Column: Content & CTAs */}
          <div>
            {/* Tag */}
            <div className="section-tag">Software Developer</div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(2.8rem, 5.5vw, 4.4rem)",
                fontWeight: 900,
                lineHeight: 1.12,
                marginBottom: "1.2rem",
                letterSpacing: "-0.03em",
                color: "#F5F7FA",
              }}
            >
              I build useful <br />
              things with <span className="lime-underline">code.</span>
            </h1>

            {/* Sub-headline */}
            <h2
              style={{
                fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)",
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: "1rem",
              }}
            >
              Software Developer | Computer Science Graduate
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: "1.02rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth: 540,
                marginBottom: "2rem",
              }}
            >
              I craft web, mobile and AI-powered applications that solve real problems.
              Passionate about building scalable products, exploring new technologies
              and making an impact through code.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                alignItems: "center",
                marginBottom: "2.5rem",
              }}
            >
              <Link href="/projects" className="btn-lime">
                Explore My Work <span>→</span>
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

            {/* Social Links Row + "Let's connect!" handwritten arrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* GitHub */}
                <a
                  href="https://github.com/vivekpawar3010"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  🐙
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/vivek-pawar-16548a275"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  in
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Twitter"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  𝕏
                </a>

                {/* Email */}
                <a
                  href="mailto:vivekpawar3010@gmail.com"
                  title="Email"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  ✉️
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/vivek.pawar.dev"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  📸
                </a>

                {/* LeetCode */}
                <Link
                  href="/leetcode"
                  title="LeetCode"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(11, 18, 28, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-lime)";
                    e.currentTarget.style.borderColor = "var(--accent-lime)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  ⚡
                </Link>
              </div>

              {/* Handwritten Note: Let's connect! with curved arrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="handwritten" style={{ fontSize: "1.35rem" }}>
                  Let&apos;s connect!
                </span>
                <span style={{ color: "var(--accent-lime)", fontSize: "1.1rem" }}>⤷</span>
              </div>
            </div>
          </div>

          {/* Right Column: Procedural 3D Green Jupiter Planet with Rings, Interactive Tilt & Terminal */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 560,
              width: "100%",
            }}
          >
            <GreenJupiterPlanet />
          </div>
        </div>
      </div>
    </section>
  );
}
