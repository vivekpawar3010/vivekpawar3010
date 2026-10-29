"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";

export default function Footer() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading dynamic profile in Footer", err));
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{
        marginTop: "auto",
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "3.5rem 0 2rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.8rem" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(200, 255, 69, 0.2) 100%)",
                  border: "1px solid rgba(200, 255, 69, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12L18 30L23 20L15 12H8Z" fill="#22D3EE" />
                  <path d="M22 12H30C32.7614 12 35 14.2386 35 17C35 19.7614 32.7614 22 30 22H24L21 28H18L24 16H30C30.5523 16 31 16.4477 31 17C31 17.5523 30.5523 18 30 18H25L22 12Z" fill="#C8FF45" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F5F7FA" }}>
                Vivek Pawar<span style={{ color: "var(--accent-lime)" }}>.</span>
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, maxWidth: 320 }}>
              Software Developer &amp; Computer Science graduate crafting useful, impactful digital products.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: "1.2rem" }}>
              <a
                href="https://github.com/vivekpawar3010"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/vivek-pawar-16548a275"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                LinkedIn
              </a>
              <a
                href="/leetcode"
                style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px",
                  color: "var(--accent-lime)",
                }}
              >
                LeetCode ⚡
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "#F5F7FA" }}>
              Navigation
            </h4>
            <div style={{ display: "grid", gap: 8, fontSize: "0.88rem" }}>
              <Link href="/" style={{ color: "var(--text-secondary)" }}>
                Home
              </Link>
              <Link href="/about" style={{ color: "var(--text-secondary)" }}>
                About Me
              </Link>
              <Link href="/projects" style={{ color: "var(--text-secondary)" }}>
                Projects
              </Link>
              <Link href="/experience" style={{ color: "var(--text-secondary)" }}>
                Experience &amp; Expertise
              </Link>
              <Link href="/leetcode" style={{ color: "var(--text-secondary)" }}>
                LeetCode Profile ⚡
              </Link>
              <Link href="/github" style={{ color: "var(--text-secondary)" }}>
                GitHub Profile 🐙
              </Link>
              <Link href="/contact" style={{ color: "var(--text-secondary)" }}>
                Contact
              </Link>
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "#F5F7FA" }}>
              Current Status
            </h4>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: "9999px",
                background: "rgba(200, 255, 69, 0.1)",
                border: "1px solid rgba(200, 255, 69, 0.3)",
                fontSize: "12px",
                color: "var(--accent-lime)",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-lime)",
                }}
              />
              Available for Opportunities
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
              Selected for TCS Digital (7 LPA). Open to high-impact internships, full-time engineering roles, and technical collaborations.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link href="/contact" className="btn-lime" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                Send a Message ✉️
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          <div>
            © {new Date().getFullYear()} Vivek Pawar. Built with Next.js 16 &amp; Turbopack.
            <Link
              href="/king"
              style={{
                marginLeft: 12,
                opacity: 0.25,
                fontSize: 12,
                textDecoration: "none",
                display: "inline-block",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.25")}
              title="King Sanctuary"
            >
              👑
            </Link>
          </div>
          <button
            onClick={scrollToTop}
            style={{
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "5px 12px",
              borderRadius: "9999px",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
