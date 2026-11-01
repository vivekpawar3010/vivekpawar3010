"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAvatarMode } from "../lib/useAvatarMode";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { currentSrc, toggleAvatarMode, isRockLee } = useAvatarMode();

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    // Cycles through: Cyber Dark -> Warm Amber (Palette 1) -> Electric Cyan (Palette 2)
    let nextTheme = "light";
    if (theme === "dark") nextTheme = "light";
    else if (theme === "light") nextTheme = "electric-cyan";
    else nextTheme = "dark";

    setTheme(nextTheme);
    localStorage.setItem("portfolio_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.dispatchEvent(new Event("themechange"));
  };

  const themeMeta = {
    dark: { icon: "🌙", label: "Dark", color: "var(--accent-brand)", bg: "rgba(255, 255, 255, 0.05)" },
    light: { icon: "☀️", label: "Warm Amber", color: "#EA580C", bg: "rgba(234, 88, 12, 0.12)" },
    "electric-cyan": { icon: "🌊", label: "Electric Cyan", color: "#0284C7", bg: "rgba(2, 132, 199, 0.12)" },
  };
  const activeMeta = themeMeta[theme] || themeMeta.dark;

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Hide Navbar completely on King's Deck Admin panel (/king)
  if (pathname?.startsWith("/king")) {
    return null;
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--nav-bg)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
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
          height: 72,
        }}
      >
        {/* Brand / Logo merged with Home Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* VP Brand Monogram Logo */}
          <Link
            href="/"
            title="Vivek Pawar • Software Developer"
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(200, 255, 69, 0.15) 100%)",
              border: "1px solid var(--border-lime)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(200, 255, 69, 0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {/* VP Modern Monogram SVG */}
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 12L18 30L23 20L15 12H8Z"
                fill="url(#paint0_linear)"
              />
              <path
                d="M22 12H30C32.7614 12 35 14.2386 35 17C35 19.7614 32.7614 22 30 22H24L21 28H18L24 16H30C30.5523 16 31 16.4477 31 17C31 17.5523 30.5523 18 30 18H25L22 12Z"
                fill="url(#paint1_linear)"
              />
              <defs>
                <linearGradient id="paint0_linear" x1="8" y1="12" x2="23" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22D3EE" />
                  <stop offset="1" stopColor="#38BDF8" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="18" y1="12" x2="35" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C8FF45" />
                  <stop offset="1" stopColor="#A3E635" />
                </linearGradient>
              </defs>
            </svg>
          </Link>

          {/* Merged Home Link with active indicator */}
          <Link
            href="/"
            title="Home • Vivek Pawar"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px 4px 6px",
              borderRadius: "9999px",
              background: pathname === "/" ? "rgba(200, 255, 69, 0.08)" : "transparent",
              border: pathname === "/" ? "1px solid rgba(200, 255, 69, 0.35)" : "1px solid transparent",
              transition: "all var(--transition-fast)",
            }}
          >
            <span
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: pathname === "/" ? "var(--accent-lime)" : "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Vivek Pawar<span style={{ color: "var(--accent-lime)" }}>.</span>
            </span>
          </Link>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: 6,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 15px",
                  borderRadius: "9999px",
                  fontSize: "0.88rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--accent-lime)" : "var(--text-secondary)",
                  background: active ? "rgba(200, 255, 69, 0.08)" : "transparent",
                  border: active ? "1px solid rgba(200, 255, 69, 0.4)" : "1px solid transparent",
                  boxShadow: active ? "0 0 12px rgba(200, 255, 69, 0.15)" : "none",
                  transition: "all var(--transition-fast)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Custom Profiles (LeetCode & GitHub) + Let's Talk CTA */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: 10,
          }}
          className="desktop-nav"
        >
          {/* Custom Profile Icon 1: LeetCode */}
          <Link
            href="/leetcode"
            title="Check Vivek's Custom LeetCode Profile (500+ Solved, Rating ~1718)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "9999px",
              background: isActive("/leetcode")
                ? "rgba(245, 158, 11, 0.2)"
                : "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#fbbf24",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 0 10px rgba(245, 158, 11, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.22)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive("/leetcode")
                ? "rgba(245, 158, 11, 0.2)"
                : "rgba(245, 158, 11, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>⚡</span>
            <span>LeetCode</span>
          </Link>

          {/* Custom Profile Icon 2: GitHub */}
          <Link
            href="/github"
            title="Check Vivek's Custom GitHub Profile & Live Dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "9999px",
              background: isActive("/github")
                ? "rgba(34, 211, 238, 0.2)"
                : "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(34, 211, 238, 0.35)",
              color: "#22D3EE",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 238, 0.22)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive("/github")
                ? "rgba(34, 211, 238, 0.2)"
                : "rgba(34, 211, 238, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>🐙</span>
            <span>GitHub</span>
          </Link>

          {/* Single Icon Theme Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Change Color Theme"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              cursor: "pointer",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.borderColor = "var(--accent-lime)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <span>{theme === "light" ? "☀️" : theme === "electric-cyan" ? "🌊" : "🌙"}</span>
          </button>

          {/* Let's Talk Button */}
          <Link href="/contact" className="btn-lime" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
            Let&apos;s Talk <span>→</span>
          </Link>
        </div>

        {/* Mobile Menu Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "1.1rem",
          }}
          className="mobile-btn"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "1rem 1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
          className="mobile-drawer"
        >
          {/* Mobile Theme Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: "0.92rem",
              fontWeight: 700,
              background: theme === "light" ? "rgba(255, 107, 0, 0.12)" : "rgba(255, 255, 255, 0.05)",
              border: theme === "light" ? "1px solid rgba(255, 107, 0, 0.4)" : "1px solid var(--border-subtle)",
              color: theme === "light" ? "#FF6B00" : "var(--accent-lime)",
              cursor: "pointer",
              marginBottom: 4,
            }}
          >
            <span>Theme Mode</span>
            <span>{theme === "light" ? "☀️ Sunfire Light (White & Orange)" : "🌙 Cyber Dark"}</span>
          </button>
          {/* Custom Profile Links in Mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
            <Link
              href="/leetcode"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px",
                borderRadius: 8,
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                color: "#fbbf24",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>⚡</span> LeetCode Profile
            </Link>
            <Link
              href="/github"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px",
                borderRadius: 8,
                background: "rgba(34, 211, 238, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.35)",
                color: "#22D3EE",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>🐙</span> GitHub Profile
            </Link>
          </div>

          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Change Color Theme"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            <span>{theme === "light" ? "☀️" : theme === "electric-cyan" ? "🌊" : "🌙"}</span>
          </button>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: "0.95rem",
              fontWeight: pathname === "/" ? 700 : 500,
              color: pathname === "/" ? "var(--accent-lime)" : "var(--text-primary)",
              background: pathname === "/" ? "rgba(200, 255, 69, 0.1)" : "var(--badge-bg)",
              textDecoration: "none",
            }}
          >
            🏠 Home
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "0.95rem",
                fontWeight: isActive(link.href) ? 700 : 500,
                color: isActive(link.href) ? "var(--accent-lime)" : "var(--text-primary)",
                background: isActive(link.href) ? "rgba(200, 255, 69, 0.1)" : "var(--badge-bg)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="btn-lime"
            style={{ width: "100%", marginTop: 8 }}
          >
            Let&apos;s Talk <span>→</span>
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
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
        @media (max-width: 899px) {
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
