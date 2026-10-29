"use client";

import { useState, useEffect, useMemo } from "react";
import defaultPosts from "../data/blog";

const CATEGORIES = [
  "All",
  "Web Development",
  "AI/ML",
  "Career & DSA",
  "System Design",
];

export default function BlogNotes() {
  const [posts, setPosts] = useState(defaultPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [readingPost, setReadingPost] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync public vault notes dynamically if available
  useEffect(() => {
    fetch("/api/king/vault")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.notes) && data.notes.length > 0) {
          const vaultPosts = data.notes.map((n) => ({
            id: n.id,
            title: n.title,
            slug: n.id,
            excerpt: n.content ? n.content.slice(0, 150) + "..." : "Technical notes & algorithm template.",
            date: n.updatedAt
              ? new Date(n.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently Updated",
            readTime: "4 min read",
            category: n.category || "DSA / LeetCode",
            tags: [n.category || "Tech Notes"],
            thumbnail: n.pinned ? "📌" : "📝",
            content: n.content,
          }));
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = vaultPosts.filter((vp) => !existingIds.has(vp.id));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch((err) => console.warn("Dynamic vault notes sync:", err));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="section-tag" style={{ justifyContent: "center" }}>
          Knowledge Hub
        </div>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            marginBottom: "0.75rem",
            fontWeight: 900,
            color: "#F5F7FA",
            letterSpacing: "-0.02em",
          }}
        >
          Articles &amp; <span className="lime-underline">Technical Notes</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 620, margin: "0 auto", fontSize: "1rem" }}>
          Sharing engineering learnings, architecture writeups, and daily problem-solving breakthroughs.
        </p>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        className="glass-card"
        style={{
          padding: "1.2rem 1.5rem",
          marginBottom: "2.5rem",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          background: "rgba(11, 18, 28, 0.85)",
        }}
      >
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search articles by title, tech stack, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              background: "#090E17",
              border: "1px solid var(--border-subtle)",
              borderRadius: "9999px",
              color: "#F5F7FA",
              fontSize: "0.92rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--accent-lime)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(200, 255, 69, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: isSelected ? "var(--accent-lime)" : "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Posts Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.8rem",
          marginBottom: "4rem",
        }}
      >
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="glass-card"
            style={{
              padding: "1.8rem",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "rgba(11, 18, 28, 0.85)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{post.thumbnail}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  {post.readTime}
                </span>
              </div>

              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-lime)", marginBottom: 6 }}>
                {post.category} • {post.date}
              </div>

              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 10px", color: "#F5F7FA", lineHeight: 1.4 }}>
                {post.title}
              </h2>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                {post.excerpt}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {Array.isArray(post.tags) &&
                  post.tags.slice(0, 2).map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
              </div>

              <button
                onClick={() => setReadingPost(post)}
                className="btn-lime"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                Read Article <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Reading Modal ── */}
      {readingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
          onClick={() => setReadingPost(null)}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: 750,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "2.5rem",
              borderRadius: 16,
              background: "#0B121C",
              border: "1px solid var(--border-lime)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent-lime)",
                  background: "rgba(200, 255, 69, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 4,
                }}
              >
                {readingPost.category}
              </span>
              <button
                onClick={() => setReadingPost(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.8rem", color: "#F5F7FA" }}>
              {readingPost.title}
            </h1>

            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Published on {readingPost.date} • {readingPost.readTime}
            </div>

            <div
              style={{
                color: "#F5F7FA",
                fontSize: "0.98rem",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
                padding: "1.2rem",
                borderRadius: 10,
                background: "rgba(5, 8, 13, 0.7)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "1.5rem",
              }}
            >
              {readingPost.content || readingPost.excerpt}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => handleCopy(readingPost.content || readingPost.excerpt)}
                className="btn-dark-pill"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                {copied ? "Copied! ✓" : "Copy Content 📋"}
              </button>
              <button
                onClick={() => setReadingPost(null)}
                className="btn-lime"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
