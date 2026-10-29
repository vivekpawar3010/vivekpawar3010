"use client";

import { useState, useEffect } from "react";

export default function TerminalWidget() {
  const [lines, setLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const commandSteps = [
    { text: "Building high-performance web apps...", status: "✓ Live & Scalable", color: "#34d399" },
    { text: "Exploring Generative AI & LLMs...", status: "✓ Gemini Integrated", color: "#38bdf8" },
    { text: "Mastering Data Structures & Algorithms...", status: "✓ 500+ Solved", color: "#fbbf24" },
    { text: "Engineering scalable microservices...", status: "✓ Next.js & Cloud", color: "#a855f7" },
    { text: "Seeking Software Engineering Roles...", status: "✓ Open to Offers", color: "#84cc16" },
  ];

  useEffect(() => {
    if (currentLineIndex < commandSteps.length) {
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, commandSteps[currentLineIndex]]);
        setCurrentLineIndex((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex]);

  return (
    <div
      className="glass-card"
      style={{
        width: "100%",
        maxWidth: 420,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15)",
        fontFamily: "var(--font-mono)",
        textAlign: "left",
      }}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
          vivek@portfolio: ~
        </span>
        <span style={{ fontSize: 11, color: "var(--accent-cyan)", fontWeight: 600 }}>bash</span>
      </div>

      {/* Terminal Body */}
      <div style={{ padding: "14px 16px", fontSize: "0.82rem", lineHeight: 1.6, minHeight: 180 }}>
        <div style={{ color: "#84cc16", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#38bdf8" }}>vivek@dev</span>:<span style={{ color: "#c084fc" }}>~</span>$ <span style={{ color: "#f8fafc" }}>run status</span>
        </div>

        {lines.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              opacity: 0,
              animation: "fadeIn 0.3s forwards",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--accent-cyan)", marginRight: 6 }}>&gt;</span>
              {item.text}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: item.color,
                background: "rgba(255, 255, 255, 0.04)",
                padding: "1px 6px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {item.status}
            </span>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span style={{ color: "#38bdf8" }}>vivek@dev</span>:<span style={{ color: "#c084fc" }}>~</span>$
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 14,
              background: "#38bdf8",
              marginLeft: 4,
              animation: "blink 1s infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
