"use client";

import { useState, useEffect } from "react";
import defaultSkills from "../data/skills";

export default function Skills() {
  const [skillsList, setSkillsList] = useState(defaultSkills);

  useEffect(() => {
    fetch("/api/king/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data.skills && Array.isArray(data.skills)) {
          setSkillsList(data.skills);
        }
      })
      .catch((err) => console.error("Error loading dynamic skills", err));
  }, []);
  return (
    <section style={{ padding: "3rem 0" }}>
      <div className="container">
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
            Technical Arsenal
          </span>
          <h2 style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", fontSize: "1rem" }}>
            The languages, frameworks, developer tools, and technologies I work with daily.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {skillsList.map((group, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "1.2rem",
                  paddingBottom: "0.8rem",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 24 }}>{group.icon}</span>
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>{group.category}</h3>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--badge-bg)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 6,
                          background:
                            item.badge === "Primary"
                              ? "rgba(56, 189, 248, 0.2)"
                              : item.badge === "LeetCode"
                              ? "rgba(245, 158, 11, 0.2)"
                              : "rgba(16, 185, 129, 0.2)",
                          color:
                            item.badge === "Primary"
                              ? "#38bdf8"
                              : item.badge === "LeetCode"
                              ? "#fbbf24"
                              : "#34d399",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
