"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAvatarMode } from "../lib/useAvatarMode";

export default function GreenJupiterPlanet() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const { toggleAvatarMode, isRockLee } = useAvatarMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const baseDim = 540;
    canvas.width = baseDim * dpr;
    canvas.height = baseDim * dpr;
    ctx.scale(dpr, dpr);

    const width = baseDim;
    const height = baseDim;
    const centerX = width / 2;
    const centerY = height / 2;
    // Significantly increased radius (almost 400px diameter sphere!)
    const radius = 195;

    let time = 0;
    let tiltX = 0;
    let tiltY = 0;

    // 3D Orbital Stardust Particles orbiting on the ring plane
    const DUST_COUNT = 32;
    const dustMotes = Array.from({ length: DUST_COUNT }, (_, i) => ({
      angle: (i / DUST_COUNT) * Math.PI * 2,
      speed: 0.007 + (i % 7) * 0.0018,
      orbitR: radius * 1.52 + (Math.sin(i * 1.7) * 16),
      size: (i % 3 === 0) ? 2.2 : 1.4,
      hue: (i % 2 === 0) ? "#C8FF45" : "#22D3EE",
      sparkle: Math.random() * Math.PI * 2,
    }));

    // Jupiter atmospheric gas bands configuration (Green / Emerald / Obsidian / Lime)
    const bands = [
      { y: -0.9, height: 0.22, colorA: "#041e11", colorB: "#093b22", speed: 0.008 },
      { y: -0.68, height: 0.18, colorA: "#0a522f", colorB: "#116d3f", speed: -0.012 },
      { y: -0.5, height: 0.24, colorA: "#10b981", colorB: "#059669", speed: 0.015 },
      { y: -0.26, height: 0.2, colorA: "#064e3b", colorB: "#022c22", speed: -0.01 },
      { y: -0.06, height: 0.26, colorA: "#84cc16", colorB: "#65a30d", speed: 0.02 }, // Equatorial Zone
      { y: 0.2, height: 0.2, colorA: "#047857", colorB: "#065f46", speed: -0.014 },
      { y: 0.4, height: 0.22, colorA: "#10b981", colorB: "#34d399", speed: 0.018 },
      { y: 0.62, height: 0.18, colorA: "#064e3b", colorB: "#022c22", speed: -0.01 },
      { y: 0.8, height: 0.22, colorA: "#022c22", colorB: "#041e11", speed: 0.007 },
    ];

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth spring lerp to mouse tilt
      tiltX += (mousePos.x * 14 - tiltX) * 0.06;
      tiltY += (mousePos.y * 14 - tiltY) * 0.06;

      const currentCenterX = centerX + tiltX;
      const currentCenterY = centerY + tiltY;

      // ── 1. Outer Atmospheric Corona & Haze Glow ──
      const glowGrad = ctx.createRadialGradient(
        currentCenterX,
        currentCenterY,
        radius * 0.82,
        currentCenterX,
        currentCenterY,
        radius * 1.38
      );
      glowGrad.addColorStop(0, "rgba(200, 255, 69, 0.28)");
      glowGrad.addColorStop(0.35, "rgba(34, 211, 238, 0.18)");
      glowGrad.addColorStop(0.7, "rgba(16, 185, 129, 0.09)");
      glowGrad.addColorStop(1, "rgba(5, 8, 13, 0)");

      ctx.save();
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius * 1.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 2. Back Tilted Planetary Ring (passing behind planet) ──
      ctx.save();
      ctx.translate(currentCenterX, currentCenterY);
      ctx.rotate(-0.35); // 20 deg axial tilt
      ctx.scale(1, 0.28); // Ring perspective compression
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.58, Math.PI, 0, false); // top half (behind planet)
      ctx.lineWidth = 18;
      const ringBackGrad = ctx.createLinearGradient(-radius * 1.58, 0, radius * 1.58, 0);
      ringBackGrad.addColorStop(0, "rgba(34, 211, 238, 0.1)");
      ringBackGrad.addColorStop(0.5, "rgba(200, 255, 69, 0.4)");
      ringBackGrad.addColorStop(1, "rgba(34, 211, 238, 0.1)");
      ctx.strokeStyle = ringBackGrad;
      ctx.shadowColor = "#C8FF45";
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Thin inner dust ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.44, Math.PI, 0, false);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(200, 255, 69, 0.45)";
      ctx.stroke();

      // ── Back Orbital Stardust Motes ──
      for (let i = 0; i < dustMotes.length; i++) {
        const m = dustMotes[i];
        m.angle += m.speed;
        const normAngle = (m.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        // Far side of orbit (behind planet): normAngle between Math.PI and Math.PI * 2
        if (normAngle > Math.PI) {
          const px = Math.cos(normAngle) * m.orbitR;
          const py = Math.sin(normAngle) * m.orbitR;
          ctx.beginPath();
          ctx.arc(px, py, m.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(200, 255, 69, 0.4)";
          ctx.fill();
        }
      }

      // ── Printed Holographic Code on the Orbit Ring ──
      ctx.font = "bold 10px 'Fira Code', monospace";
      ctx.fillStyle = "rgba(200, 255, 69, 0.85)";
      ctx.shadowColor = "#C8FF45";
      ctx.shadowBlur = 10;
      ctx.fillText("const vivek = { role: 'Software Developer', goal: 'Build Impact' };", -radius * 1.15, -12);

      ctx.restore();

      // ── 3. Planet Sphere Clipping & Swirling Gas Bands ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius, 0, Math.PI * 2);
      ctx.clip(); // Mask everything inside the planet sphere

      // Base planetary core gradient
      const coreGrad = ctx.createRadialGradient(
        currentCenterX - radius * 0.35,
        currentCenterY - radius * 0.35,
        radius * 0.2,
        currentCenterX,
        currentCenterY,
        radius
      );
      coreGrad.addColorStop(0, "#064e3b");
      coreGrad.addColorStop(0.6, "#022c22");
      coreGrad.addColorStop(1, "#011711");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(currentCenterX - radius, currentCenterY - radius, radius * 2, radius * 2);

      // Render flowing horizontal atmospheric bands
      bands.forEach((band) => {
        const bandCenterY = currentCenterY + band.y * radius;
        const bandHeight = band.height * radius;
        const waveOffset = Math.sin(time * 1.5 + band.y * 3) * 8;

        const bandGrad = ctx.createLinearGradient(
          currentCenterX - radius,
          bandCenterY - bandHeight / 2,
          currentCenterX + radius,
          bandCenterY + bandHeight / 2
        );
        bandGrad.addColorStop(0, band.colorA);
        bandGrad.addColorStop(0.5, band.colorB);
        bandGrad.addColorStop(1, band.colorA);

        ctx.fillStyle = bandGrad;
        ctx.beginPath();
        ctx.moveTo(currentCenterX - radius, bandCenterY - bandHeight / 2 + waveOffset);

        const steps = 18;
        for (let s = 0; s <= steps; s++) {
          const x = currentCenterX - radius + (s / steps) * (radius * 2);
          const sineY =
            Math.sin(s * 0.6 + time * (band.speed * 80) + band.y * 4) * (bandHeight * 0.2) +
            Math.sin((x + waveOffset) * 0.03) * 4;
          ctx.lineTo(x, bandCenterY - bandHeight / 2 + sineY);
        }

        ctx.lineTo(currentCenterX + radius, bandCenterY + bandHeight / 2 + waveOffset);
        for (let s = steps; s >= 0; s--) {
          const x = currentCenterX - radius + (s / steps) * (radius * 2);
          const sineY =
            Math.sin(s * 0.6 + time * (band.speed * 80) + band.y * 4 + 1.2) * (bandHeight * 0.2) +
            Math.sin((x + waveOffset + 20) * 0.03) * 4;
          ctx.lineTo(x, bandCenterY + bandHeight / 2 + sineY);
        }
        ctx.closePath();
        ctx.fill();
      });

      // ── Printed Code Line in Upper Atmospheric Zone ──
      ctx.font = "bold 9px 'Fira Code', monospace";
      ctx.fillStyle = "rgba(200, 255, 69, 0.6)";
      ctx.fillText("// while(alive) { learn(); build(); improve(); }", currentCenterX - radius * 0.65, currentCenterY - radius * 0.45);

      // ── 4. The Iconic "Great Green Storm Vortex" ──
      const stormX = currentCenterX + Math.cos(time * 0.35) * (radius * 0.42);
      const stormY = currentCenterY + radius * 0.26 + Math.sin(time * 0.35) * 5;
      const stormRadiusX = 36;
      const stormRadiusY = 22;

      ctx.save();
      ctx.translate(stormX, stormY);
      ctx.rotate(-0.1);
      const stormGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, stormRadiusX);
      stormGrad.addColorStop(0, "#C8FF45"); // Eye of the storm
      stormGrad.addColorStop(0.4, "#10b981");
      stormGrad.addColorStop(0.8, "#047857");
      stormGrad.addColorStop(1, "rgba(6, 78, 59, 0)");

      ctx.fillStyle = stormGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, stormRadiusX, stormRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Swirling storm rings inside
      ctx.strokeStyle = "rgba(200, 255, 69, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, stormRadiusX * 0.65, stormRadiusY * 0.65, time * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── 5. 3D Spherical Shadow & Sunlight Shading (Terminator) ──
      const sphereShade = ctx.createRadialGradient(
        currentCenterX - radius * 0.42,
        currentCenterY - radius * 0.45,
        radius * 0.15,
        currentCenterX + radius * 0.25,
        currentCenterY + radius * 0.28,
        radius * 1.15
      );
      sphereShade.addColorStop(0, "rgba(255, 255, 255, 0.32)"); // Sun highlight
      sphereShade.addColorStop(0.3, "rgba(200, 255, 69, 0.08)");
      sphereShade.addColorStop(0.65, "rgba(5, 8, 13, 0.4)");
      sphereShade.addColorStop(0.88, "rgba(5, 8, 13, 0.85)");
      sphereShade.addColorStop(1, "rgba(5, 8, 13, 0.96)"); // Pitch black space terminator

      ctx.fillStyle = sphereShade;
      ctx.fillRect(currentCenterX - radius, currentCenterY - radius, radius * 2, radius * 2);

      // ── 6. Atmospheric Edge Glow (Fresnel Limb Effect) ──
      const limbGrad = ctx.createRadialGradient(
        currentCenterX,
        currentCenterY,
        radius * 0.82,
        currentCenterX,
        currentCenterY,
        radius
      );
      limbGrad.addColorStop(0, "rgba(200, 255, 69, 0)");
      limbGrad.addColorStop(0.85, "rgba(200, 255, 69, 0.3)");
      limbGrad.addColorStop(1, "rgba(34, 211, 238, 0.75)"); // Emerald-cyan atmospheric edge

      ctx.fillStyle = limbGrad;
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Exit sphere clipping

      // ── 7. Front Tilted Planetary Ring (passing in front of sphere) ──
      ctx.save();
      ctx.translate(currentCenterX, currentCenterY);
      ctx.rotate(-0.35);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.58, 0, Math.PI, false); // bottom half (in front)
      ctx.lineWidth = 18;
      const ringFrontGrad = ctx.createLinearGradient(-radius * 1.58, 0, radius * 1.58, 0);
      ringFrontGrad.addColorStop(0, "rgba(34, 211, 238, 0.25)");
      ringFrontGrad.addColorStop(0.5, "rgba(200, 255, 69, 0.8)");
      ringFrontGrad.addColorStop(1, "rgba(34, 211, 238, 0.25)");
      ctx.strokeStyle = ringFrontGrad;
      ctx.shadowColor = "#C8FF45";
      ctx.shadowBlur = 22;
      ctx.stroke();

      // Front thin dust ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.44, 0, Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(200, 255, 69, 0.85)";
      ctx.stroke();

      // ── Front Orbital Stardust Motes (passing in front with bright shimmer) ──
      for (let i = 0; i < dustMotes.length; i++) {
        const m = dustMotes[i];
        const normAngle = (m.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        // Near side of orbit (in front of planet): normAngle between 0 and Math.PI
        if (normAngle <= Math.PI) {
          const px = Math.cos(normAngle) * m.orbitR;
          const py = Math.sin(normAngle) * m.orbitR;
          const twinkle = Math.sin(time * 3 + m.sparkle) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(px, py, m.size * twinkle, 0, Math.PI * 2);
          ctx.fillStyle = m.hue;
          ctx.shadowColor = m.hue;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 600,
        minHeight: 560,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {/* Canvas rendering the enlarged Green Jupiter gas giant with rotating rings */}
      <canvas
        ref={canvasRef}
        style={{
          width: "min(520px, 94vw)",
          height: "min(520px, 94vw)",
          display: "block",
          filter: isHovered
            ? "drop-shadow(0 0 45px rgba(200, 255, 69, 0.5))"
            : "drop-shadow(0 0 30px rgba(200, 255, 69, 0.35))",
          transition: "filter 0.3s ease",
          zIndex: 1,
        }}
      />

      {/* Center VP Core Emblem / Avatar Switcher */}
      <div
        onClick={toggleAvatarMode}
        title="Jupiter Core • Click to toggle: Vivek Pawar 👤 ↔ Rock Lee 🍃"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "rgba(5, 8, 13, 0.85)",
          border: "2px solid rgba(200, 255, 69, 0.85)",
          boxShadow: "0 0 30px rgba(200, 255, 69, 0.55), inset 0 0 18px rgba(34, 211, 238, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          zIndex: 3,
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)")}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M8 12L18 30L23 20L15 12H8Z" fill="#22D3EE" />
          <path d="M22 12H30C32.7614 12 35 14.2386 35 17C35 19.7614 32.7614 22 30 22H24L21 28H18L24 16H30C30.5523 16 31 16.4477 31 17C31 17.5523 30.5523 18 30 18H25L22 12Z" fill="#C8FF45" />
        </svg>

        <span
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            fontSize: 11,
            background: "#05080D",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {isRockLee ? "🍃" : "👤"}
        </span>
      </div>

      {/* ── Interactive Floating Pills orbiting around the Outer Rings ── */}
      {/* 1. Build Innovate + (Top Left outer ring) */}
      <div
        className="glass-card"
        style={{
          position: "absolute",
          top: "8%",
          left: "0%",
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: "11px",
          fontWeight: 700,
          color: "#F5F7FA",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "rgba(11, 18, 28, 0.9)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
          zIndex: 4,
          cursor: "default",
          transition: "transform 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
          e.currentTarget.style.borderColor = "var(--accent-lime)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
        }}
      >
        Build Innovate <span style={{ color: "var(--accent-lime)" }}>+</span>
      </div>

      {/* 2. Learn Everyday + (Top Right outer ring) */}
      <div
        className="glass-card"
        style={{
          position: "absolute",
          top: "8%",
          right: "0%",
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: "11px",
          fontWeight: 700,
          color: "#F5F7FA",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "rgba(11, 18, 28, 0.9)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
          zIndex: 4,
          cursor: "default",
          transition: "transform 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
          e.currentTarget.style.borderColor = "var(--accent-lime)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
        }}
      >
        Learn Everyday <span style={{ color: "var(--accent-lime)" }}>+</span>
      </div>

      {/* 3. Solve Real Problems (Bottom Left) */}
      <div
        className="glass-card"
        style={{
          position: "absolute",
          bottom: "12%",
          left: "0%",
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: "11px",
          fontWeight: 700,
          color: "#F5F7FA",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "rgba(11, 18, 28, 0.9)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
          zIndex: 4,
          cursor: "default",
          transition: "transform 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
          e.currentTarget.style.borderColor = "var(--accent-lime)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
        }}
      >
        Solve <br />
        Real Problems
      </div>

      {/* 4. Create Impact + (Bottom Right) */}
      <div
        className="glass-card"
        style={{
          position: "absolute",
          bottom: "12%",
          right: "2%",
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: "11px",
          fontWeight: 700,
          color: "#F5F7FA",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          background: "rgba(11, 18, 28, 0.9)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
          zIndex: 4,
          cursor: "default",
          transition: "transform 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
          e.currentTarget.style.borderColor = "var(--accent-lime)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
        }}
      >
        Create <br />
        Impact <span style={{ color: "var(--accent-lime)" }}>+</span>
      </div>

      {/* 5. Sleek Developer Terminal HUD (Docked Non-Obstructive Overlay with Minimize/Expand Toggle) */}
      <div
        style={{
          position: "absolute",
          bottom: "-4%",
          right: "0%",
          width: "min(300px, 85vw)",
          background: "rgba(11, 18, 28, 0.88)",
          borderRadius: "12px",
          border: "1px solid rgba(200, 255, 69, 0.3)",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.8), 0 0 20px rgba(200, 255, 69, 0.12)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          lineHeight: 1.5,
          overflow: "hidden",
          zIndex: 5,
          backdropFilter: "blur(14px)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Terminal Title Bar with Minimize Toggle */}
        <div
          onClick={() => setTerminalMinimized(!terminalMinimized)}
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            padding: "7px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            borderBottom: terminalMinimized ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
          }}
          title={terminalMinimized ? "Click to expand terminal" : "Click to collapse to reveal full planet"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f43f5e" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
            </div>
            <span style={{ color: "var(--accent-lime)", fontSize: "10px", fontWeight: 700 }}>
              developer@vivek:~
            </span>
          </div>

          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            {terminalMinimized ? "⤢ [Expand]" : "− [Collapse]"}
          </span>
        </div>

        {/* Code Body (Collapsible so Jupiter is 100% visible) */}
        {!terminalMinimized && (
          <div style={{ padding: "10px 14px", color: "#F5F7FA" }}>
            <div>
              <span style={{ color: "#a855f7" }}>const</span>{" "}
              <span style={{ color: "var(--accent-lime)" }}>vivek</span> = &#123;
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: "#38bdf8" }}>name</span>: <span style={{ color: "#fbbf24" }}>&quot;Vivek Pawar&quot;</span>,
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: "#38bdf8" }}>role</span>: <span style={{ color: "#fbbf24" }}>&quot;Software Developer&quot;</span>,
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: "#38bdf8" }}>location</span>: <span style={{ color: "#fbbf24" }}>&quot;Pandharpur, India&quot;</span>,
            </div>
            <div style={{ paddingLeft: 12 }}>
              <span style={{ color: "#38bdf8" }}>focus</span>: [<span style={{ color: "#fbbf24" }}>&quot;Web&quot;</span>, <span style={{ color: "#fbbf24" }}>&quot;AI&quot;</span>, <span style={{ color: "#fbbf24" }}>&quot;DSA&quot;</span>]
            </div>
            <div>&#125;;</div>
            <div style={{ marginTop: 4, color: "var(--accent-lime)", fontSize: "10px" }}>
              while(alive) &#123; build(); improve(); &#125;
            </div>
          </div>
        )}
      </div>

      {/* 6. Mini Pill: Turning ideas into real products [→] (Bottom Center-Left) */}
      <Link
        href="/projects"
        style={{
          position: "absolute",
          bottom: "-2%",
          left: "4%",
          width: 210,
          background: "rgba(11, 18, 28, 0.92)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "10px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
          zIndex: 5,
          textDecoration: "none",
          transition: "transform 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.borderColor = "var(--accent-lime)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, color: "#f97316" }}>⚡</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#F5F7FA", lineHeight: 1.3 }}>
            Turning ideas into <br />
            real products.
          </span>
        </div>
        <span style={{ color: "var(--accent-lime)", fontSize: "13px" }}>→</span>
      </Link>
    </div>
  );
}
