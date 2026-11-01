"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAvatarMode } from "../lib/useAvatarMode";

export default function HolographicPortrait({ compact = false }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [auraBoost, setAuraBoost] = useState(false);
  const { currentSrc, toggleAvatarMode, isRockLee } = useAvatarMode();

  // Mouse move 3D parallax tilt calculation
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalized tilt range: -15deg to +15deg
    setTilt({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Badges data
  const floatingBadges = [
    {
      id: "leetcode",
      title: "500+ LeetCode",
      sub: "Rating ~1718",
      icon: "⚡",
      color: "#fbbf24",
      bg: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.4)",
      style: { top: "8%", left: "-6%" },
      delay: "0s",
      link: "/leetcode",
    },
    {
      id: "tcs",
      title: "TCS Digital",
      sub: "Selected • 7 LPA",
      icon: "💼",
      color: "#C8FF45",
      bg: "rgba(200, 255, 69, 0.15)",
      border: "rgba(200, 255, 69, 0.4)",
      style: { top: "16%", right: "-8%" },
      delay: "1.2s",
      link: "/experience",
    },
    {
      id: "cgpa",
      title: "B.Tech CSE",
      sub: "9.21 CGPA",
      icon: "🎓",
      color: "#22D3EE",
      bg: "rgba(34, 211, 238, 0.15)",
      border: "rgba(34, 211, 238, 0.4)",
      style: { bottom: "18%", left: "-8%" },
      delay: "2.4s",
      link: "/about",
    },
    {
      id: "impact",
      title: "Full-Stack Dev",
      sub: "Next.js • AI • Spring",
      icon: "🚀",
      color: "#c084fc",
      bg: "rgba(192, 132, 252, 0.15)",
      border: "rgba(192, 132, 252, 0.4)",
      style: { bottom: "12%", right: "-6%" },
      delay: "3.6s",
      link: "/projects",
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: compact ? "min(340px, 92vw)" : "min(440px, 92vw)",
        height: compact ? 420 : 540,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1100,
        margin: "0 auto",
      }}
    >
      {/* ── 1. Pulsing Atmospheric Nebula Glow (Backdrop: Aura-Glow Token) ── */}
      <div
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--aura-glow-start) 0%, var(--aura-glow-end) 50%, transparent 80%)",
          opacity: auraBoost ? 0.7 : isHovered ? 0.5 : 0.35,
          filter: "blur(45px)",
          transform: `scale(${auraBoost ? 1.25 : isHovered ? 1.15 : 1})`,
          transition: "transform 0.4s ease, opacity 0.4s ease",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── 2. Rotating Cybernetic Planetary Ring 1 ── */}
      <div
        className="cyber-ring-1"
        style={{
          position: "absolute",
          width: "115%",
          height: "115%",
          borderRadius: "50%",
          border: "2px dashed var(--accent-lime)",
          opacity: 0.65,
          boxShadow: "0 0 25px var(--accent-lime)",
          transform: `rotateX(68deg) rotateY(-18deg) translateZ(10px)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── 3. Rotating Cybernetic Planetary Ring 2 ── */}
      <div
        className="cyber-ring-2"
        style={{
          position: "absolute",
          width: "125%",
          height: "125%",
          borderRadius: "50%",
          border: "1.5px solid var(--accent-lime)",
          opacity: 0.65,
          boxShadow: "0 0 25px var(--accent-lime)",
          transform: `rotateX(72deg) rotateY(24deg) translateZ(-10px)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── 4. Main 3D Tilted Portrait Card ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
          zIndex: 3,
        }}
      >
        {/* Holographic Circular Pedestal / Floor Grid */}
        <div
          style={{
            position: "absolute",
            bottom: "2%",
            width: "82%",
            height: 90,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, var(--accent-secondary) 0%, var(--accent-brand) 40%, transparent 75%)",
            opacity: 0.55,
            border: "1px solid var(--accent-brand)",
            transform: "rotateX(75deg)",
            boxShadow: "0 0 35px var(--accent-brand), inset 0 0 20px var(--accent-secondary)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* ── 5. Vivek's Transparent Cutout Image (Crystal Clear & Natural) ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isRockLee ? "/images/rock-lee.png" : "/images/vivek-portrait-cutout.png"}
          alt="Vivek Pawar - Software Developer"
          style={{
            width: "auto",
            height: "92%",
            maxHeight: compact ? 390 : 500,
            objectFit: "contain",
            objectPosition: "bottom center",
            zIndex: 4,
            filter: isHovered
              ? "drop-shadow(0 15px 35px var(--accent-brand)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.45))"
              : "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.55))",
            transition: "filter 0.3s ease, transform 0.2s ease",
            transform: `translateZ(30px)`,
            userSelect: "none",
            pointerEvents: "auto",
          }}
          onError={(e) => {
            e.currentTarget.src = "/images/vivek-profile-photo.png";
          }}
        />

        {/* ── 6. Floating Holographic Tech Badges ── */}
        {floatingBadges.map((b) => (
          <Link
            key={b.id}
            href={b.link}
            className="floating-holo-badge"
            style={{
              position: "absolute",
              ...b.style,
              padding: "7px 12px",
              borderRadius: 12,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06), 0 0 15px var(--badge-bg)",
              textDecoration: "none",
              zIndex: 6,
              transform: "translateZ(45px)",
              animationDelay: b.delay,
              transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateZ(65px) scale(1.08)";
              e.currentTarget.style.borderColor = "var(--accent-lime)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateZ(45px) scale(1)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {b.title}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-lime)" }}>
                {b.sub}
              </div>
            </div>
          </Link>
        ))}

        {/* ── 7. Bottom Glass HUD Bar: Dev Status & Aura Boost (Swap controlled by Admin only) ── */}
        <div
          style={{
            position: "absolute",
            bottom: "-3%",
            left: "50%",
            transform: "translateX(-50%) translateZ(50px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "5px 14px",
            borderRadius: "9999px",
            background: "var(--bg-glass)",
            border: "1px solid var(--border-subtle)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            zIndex: 7,
            whiteSpace: "nowrap",
          }}
        >
          {/* Status Label */}
          <div
            style={{
              color: isRockLee ? "#34d399" : "var(--accent-lime)",
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{isRockLee ? "🍃 Rock Lee" : "👤 Vivek Pawar"}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>&bull; Software Developer</span>
          </div>

          <span style={{ color: "var(--border-subtle)" }}>|</span>

          {/* Aura Intensity Boost */}
          <button
            onClick={() => setAuraBoost(!auraBoost)}
            type="button"
            title="Toggle Hologram Aura Intensity Boost"
            style={{
              background: "transparent",
              border: "none",
              color: auraBoost ? "var(--accent-lime)" : "var(--text-secondary)",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
            }}
          >
            <span>✨</span>
            <span>{auraBoost ? "Aura MAX" : "Aura"}</span>
          </button>
        </div>
      </div>

      {/* ── CSS Animations for Rings, Floating Badges & Hologram Scanline ── */}
      <style jsx>{`
        @keyframes orbitClockwise {
          0% {
            transform: rotateX(68deg) rotateY(-18deg) rotateZ(0deg) translateZ(10px);
          }
          100% {
            transform: rotateX(68deg) rotateY(-18deg) rotateZ(360deg) translateZ(10px);
          }
        }

        @keyframes orbitCounterClockwise {
          0% {
            transform: rotateX(72deg) rotateY(24deg) rotateZ(360deg) translateZ(-10px);
          }
          100% {
            transform: rotateX(72deg) rotateY(24deg) rotateZ(0deg) translateZ(-10px);
          }
        }

        @keyframes scanlineSweep {
          0% {
            top: 15%;
            opacity: 0.1;
          }
          30% {
            opacity: 0.9;
          }
          70% {
            opacity: 0.9;
          }
          100% {
            top: 85%;
            opacity: 0.1;
          }
        }

        @keyframes floatSinusoidal {
          0%, 100% {
            transform: translateZ(45px) translateY(0px);
          }
          50% {
            transform: translateZ(45px) translateY(-8px);
          }
        }

        .cyber-ring-1 {
          animation: orbitClockwise 18s linear infinite;
        }

        .cyber-ring-2 {
          animation: orbitCounterClockwise 14s linear infinite;
        }

        .holo-scanline {
          animation: scanlineSweep 4.5s ease-in-out infinite alternate;
        }

        .floating-holo-badge {
          animation: floatSinusoidal 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

