"use client";

import Link from "next/link";
import profile from "../data/profile";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{
        marginTop: "auto",
        background: "var(--nav-bg)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "3rem 0 2rem",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.8rem" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#ffffff",
                }}
              >
                VP
              </div>
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{profile.name}</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 320 }}>
              {profile.tagline}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                GitHub
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                LinkedIn
              </a>
              <a
                href={profile.leetcode}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                LeetCode
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Quick Navigation
            </h4>
            <div style={{ display: "grid", gap: 8, fontSize: "0.9rem" }}>
              <Link href="/" style={{ color: "var(--text-secondary)" }}>
                Home
              </Link>
              <Link href="/about" style={{ color: "var(--text-secondary)" }}>
                About Me & Journey
              </Link>
              <Link href="/projects" style={{ color: "var(--text-secondary)" }}>
                Featured Projects
              </Link>
              <Link href="/leetcode" style={{ color: "var(--text-secondary)" }}>
                Live LeetCode Analytics
              </Link>
              <Link href="/github" style={{ color: "var(--text-secondary)" }}>
                Live GitHub Dashboard
              </Link>
              <Link href="/contact" style={{ color: "var(--text-secondary)" }}>
                Contact & Inquiries
              </Link>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Current Status
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              {profile.status}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link href="/contact" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
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
            fontSize: "0.85rem",
            color: "var(--text-muted)",
          }}
        >
          <div>
            © {new Date().getFullYear()} {profile.name}. Built with Next.js 16 & Turbopack.
            <Link
              href="/king"
              style={{
                marginLeft: 12,
                opacity: 0.3,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-block",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.3")}
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
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
