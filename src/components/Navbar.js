"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("portfolio_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "LeetCode", href: "/leetcode", isSpecial: "leetcode" },
    { label: "GitHub", href: "/github", isSpecial: "github" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 68,
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: "#ffffff",
              boxShadow: "0 2px 10px rgba(56, 189, 248, 0.35)",
            }}
          >
            VP
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
              Vivek Pawar
            </span>
            <span
              style={{
                display: "block",
                fontSize: 10,
                color: "var(--accent-cyan)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Portfolio & Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Links + Theme Toggle */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: 8,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);

            if (link.isSpecial === "leetcode") {
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      border: active ? "1px solid #60a5fa" : "1px solid rgba(59, 130, 246, 0.4)",
                      borderRadius: "8px",
                      padding: "7px 14px",
                      background: active
                        ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                        : "rgba(37, 99, 235, 0.15)",
                      color: active ? "#ffffff" : "var(--accent-blue)",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>⚡</span> LeetCode
                  </button>
                </Link>
              );
            }

            if (link.isSpecial === "github") {
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      border: active ? "1px solid #4ade80" : "1px solid rgba(22, 163, 74, 0.4)",
                      borderRadius: "8px",
                      padding: "7px 14px",
                      background: active
                        ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                        : "rgba(22, 163, 74, 0.15)",
                      color: active ? "#ffffff" : "var(--accent-emerald)",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>🐙</span> GitHub
                  </button>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.92rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: active ? "rgba(56, 189, 248, 0.1)" : "transparent",
                  transition: "all 0.18s ease",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Theme Toggle Button (Desktop) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            style={{
              marginLeft: 6,
              background: "var(--badge-bg)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              padding: "7px 12px",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all var(--transition-fast)",
            }}
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </nav>

        {/* Mobile menu + Theme button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              display: "none",
              background: "var(--badge-bg)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 14,
            }}
            className="mobile-btn"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            className="mobile-btn"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--bg-glass)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "1rem 1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: isActive(link.href) ? 600 : 500,
                color: isActive(link.href) ? "var(--accent-cyan)" : "var(--text-primary)",
                background: isActive(link.href) ? "rgba(56, 189, 248, 0.1)" : "var(--badge-bg)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Responsive media styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-btn {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
