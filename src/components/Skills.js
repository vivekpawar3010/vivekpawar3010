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

  const proficiencyLevels = {
    "React.js": 92,
    "Next.js": 90,
    "Tailwind CSS": 95,
    "REST APIs": 88,
    "Java": 88,
    "Python": 84,
    "JavaScript": 92,
    "C / C++": 78,
    "SQL": 85,
    "PostgreSQL": 86,
    "Firebase": 90,
    "MongoDB": 82,
    "Android Studio": 80,
    "React Native": 78,
    "Gemini API": 88,
    "Git / GitHub": 90,
    "VS Code": 95,
    "Sanity CMS": 84,
  };

  return (
    <section style={{ padding: "2.5rem 0 4rem" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-tag" style={{ justifyContent: "center" }}>
            Technical Arsenal
          </div>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              marginBottom: "0.75rem",
              fontWeight: 900,
              color: "#F5F7FA",
            }}
          >
            Skills &amp; <span className="lime-underline">Technologies</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: 640,
              margin: "0 auto",
              fontSize: "1rem",
            }}
          >
            Technologies, frameworks, and developer tools I work with daily and am continuously mastering.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.8rem",
          }}
        >
          {skillsList.map((group, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "1.8rem",
                display: "flex",
                flexDirection: "column",
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                background: "rgba(11, 18, 28, 0.85)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.2rem",
                  paddingBottom: "0.8rem",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{group.icon}</span>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700, color: "#F5F7FA" }}>
                    {group.category}
                  </h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-lime)" }}>
                  {Array.isArray(group.items) ? group.items.length : 0} Skills
                </span>
              </div>

              {/* Items with visual progress bars */}
              <div style={{ display: "grid", gap: "1rem" }}>
                {Array.isArray(group.items) &&
                  group.items.map((item, itemIdx) => {
                    const levelPercent = proficiencyLevels[item.name] || 82;
                    return (
                      <div key={itemIdx}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "#F5F7FA" }}>
                            {item.name}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  background: "rgba(200, 255, 69, 0.15)",
                                  color: "var(--accent-lime)",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                              {levelPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Meter Bar */}
                        <div
                          style={{
                            width: "100%",
                            height: 6,
                            borderRadius: 10,
                            background: "rgba(255, 255, 255, 0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${levelPercent}%`,
                              height: "100%",
                              borderRadius: 10,
                              background:
                                levelPercent >= 90
                                  ? "linear-gradient(90deg, #22D3EE 0%, var(--accent-lime) 100%)"
                                  : "linear-gradient(90deg, #818cf8 0%, #22D3EE 100%)",
                              boxShadow: "0 0 10px rgba(200, 255, 69, 0.3)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
