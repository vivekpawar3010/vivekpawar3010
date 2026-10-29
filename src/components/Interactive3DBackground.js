"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Interactive3DBackground() {
  const canvasRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Mouse tracking with smooth lerp
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const onMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetTiltX = ((e.clientX - halfW) / halfW) * 18;
      targetTiltY = ((e.clientY - halfH) / halfH) * 18;
    };

    const onResize = () => {
      dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);

    // ── Starfield background particles ──
    const STAR_COUNT = 85;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
      isGreen: Math.random() > 0.65,
    }));

    // ── Background Green Jupiter Atmospheric Bands ──
    const bands = [
      { y: -0.9, height: 0.22, colorA: "#041f12", colorB: "#06381e", speed: 0.006 },
      { y: -0.68, height: 0.18, colorA: "#0a4527", colorB: "#0f6137", speed: -0.009 },
      { y: -0.5, height: 0.24, colorA: "#10b981", colorB: "#047857", speed: 0.012 },
      { y: -0.26, height: 0.2, colorA: "#064e3b", colorB: "#022c22", speed: -0.008 },
      { y: -0.06, height: 0.26, colorA: "#84cc16", colorB: "#4d7c0f", speed: 0.015 }, // Equator
      { y: 0.2, height: 0.2, colorA: "#059669", colorB: "#064e3b", speed: -0.01 },
      { y: 0.4, height: 0.22, colorA: "#10b981", colorB: "#34d399", speed: 0.013 },
      { y: 0.62, height: 0.18, colorA: "#044e31", colorB: "#022c22", speed: -0.008 },
      { y: 0.8, height: 0.22, colorA: "#022c22", colorB: "#041f12", speed: 0.005 },
    ];

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp to mouse tilt
      tiltX += (targetTiltX - tiltX) * 0.04;
      tiltY += (targetTiltY - tiltY) * 0.04;

      // ── 1. Cosmic Stars & Stardust ──
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const pulse = Math.sin(time * 2 + s.phase) * 0.3 + 0.7;
        const currentAlpha = Math.min(1, Math.max(0.1, s.alpha * pulse));

        ctx.fillStyle = s.isGreen
          ? `rgba(200, 255, 69, ${currentAlpha})`
          : `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        // Subtle parallax on stars
        const starX = (s.x + tiltX * 0.4 + width) % width;
        const starY = (s.y + tiltY * 0.4 + height) % height;
        ctx.arc(starX, starY, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 2. Background Green Jupiter Position ──
      // On non-home pages (or deep scroll), display prominently.
      // On desktop: positioned in upper-right cosmic field; on mobile: centered top
      const isMobile = width < 768;
      const isHome = pathname === "/";
      
      // On home page, the background Jupiter sits slightly deeper and offset so it complements the Hero;
      // on all other pages (/about, /projects, /experience, /contact, etc.), it shines clearly as the background centerpiece!
      const baseCenterX = isMobile ? width * 0.5 : isHome ? width * 0.86 : width * 0.82;
      const baseCenterY = isMobile ? height * 0.24 : isHome ? height * 0.28 : height * 0.32;
      const baseRadius = isMobile
        ? Math.min(width, height) * 0.26
        : isHome
        ? Math.min(width, height) * 0.28
        : Math.min(width, height) * 0.32;

      const jupiterX = baseCenterX + tiltX;
      const jupiterY = baseCenterY + tiltY;
      const jupiterR = Math.max(120, baseRadius);

      // Planet opacity: on homepage, slightly more ambient; on other pages, luminous
      const planetAlpha = isHome ? 0.38 : 0.72;

      ctx.save();
      ctx.globalAlpha = planetAlpha;

      // ── A. Outer Atmospheric Corona & Nebula Glow ──
      const corona = ctx.createRadialGradient(
        jupiterX,
        jupiterY,
        jupiterR * 0.8,
        jupiterX,
        jupiterY,
        jupiterR * 1.55
      );
      corona.addColorStop(0, "rgba(200, 255, 69, 0.25)");
      corona.addColorStop(0.35, "rgba(34, 211, 238, 0.16)");
      corona.addColorStop(0.7, "rgba(16, 185, 129, 0.08)");
      corona.addColorStop(1, "rgba(5, 8, 13, 0)");

      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(jupiterX, jupiterY, jupiterR * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // ── B. Back Tilted Planetary Dust Ring ──
      ctx.save();
      ctx.translate(jupiterX, jupiterY);
      ctx.rotate(-0.35); // 20 deg axial tilt
      ctx.scale(1, 0.26);

      // Wide back ring
      ctx.beginPath();
      ctx.arc(0, 0, jupiterR * 1.7, Math.PI, 0, false);
      ctx.lineWidth = 18;
      const backRingGrad = ctx.createLinearGradient(-jupiterR * 1.7, 0, jupiterR * 1.7, 0);
      backRingGrad.addColorStop(0, "rgba(34, 211, 238, 0.1)");
      backRingGrad.addColorStop(0.5, "rgba(200, 255, 69, 0.4)");
      backRingGrad.addColorStop(1, "rgba(34, 211, 238, 0.1)");
      ctx.strokeStyle = backRingGrad;
      ctx.shadowColor = "#C8FF45";
      ctx.shadowBlur = 16;
      ctx.stroke();

      // Fine inner ring
      ctx.beginPath();
      ctx.arc(0, 0, jupiterR * 1.5, Math.PI, 0, false);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(200, 255, 69, 0.45)";
      ctx.stroke();
      ctx.restore();

      // ── C. Planet Sphere Clipping & Atmospheric Gas Bands ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(jupiterX, jupiterY, jupiterR, 0, Math.PI * 2);
      ctx.clip();

      // Deep obsidian green base sphere
      const baseGrad = ctx.createRadialGradient(
        jupiterX - jupiterR * 0.35,
        jupiterY - jupiterR * 0.35,
        jupiterR * 0.2,
        jupiterX,
        jupiterY,
        jupiterR
      );
      baseGrad.addColorStop(0, "#0b4226");
      baseGrad.addColorStop(0.7, "#042013");
      baseGrad.addColorStop(1, "#020f09");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(jupiterX - jupiterR, jupiterY - jupiterR, jupiterR * 2, jupiterR * 2);

      // Render horizontal turbulent gas bands
      bands.forEach((b) => {
        const bandCenterY = jupiterY + b.y * jupiterR;
        const bandH = b.height * jupiterR;
        const waveOffset = Math.sin(time * 1.5 + b.y * 3) * 6;

        const bandGrad = ctx.createLinearGradient(
          jupiterX - jupiterR,
          bandCenterY - bandH / 2,
          jupiterX + jupiterR,
          bandCenterY + bandH / 2
        );
        bandGrad.addColorStop(0, b.colorA);
        bandGrad.addColorStop(0.5, b.colorB);
        bandGrad.addColorStop(1, b.colorA);

        ctx.fillStyle = bandGrad;
        ctx.beginPath();
        ctx.moveTo(jupiterX - jupiterR, bandCenterY - bandH / 2 + waveOffset);

        const steps = 14;
        for (let s = 0; s <= steps; s++) {
          const px = jupiterX - jupiterR + (s / steps) * (jupiterR * 2);
          const py =
            bandCenterY -
            bandH / 2 +
            Math.sin(s * 0.7 + time * (b.speed * 80) + b.y * 4) * (bandH * 0.22) +
            waveOffset;
          ctx.lineTo(px, py);
        }

        ctx.lineTo(jupiterX + jupiterR, bandCenterY + bandH / 2 + waveOffset);
        for (let s = steps; s >= 0; s--) {
          const px = jupiterX - jupiterR + (s / steps) * (jupiterR * 2);
          const py =
            bandCenterY +
            bandH / 2 +
            Math.sin(s * 0.7 + time * (b.speed * 80) + b.y * 4 + 1.2) * (bandH * 0.22) +
            waveOffset;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });

      // ── D. The Great Green Storm Vortex ──
      const stormAngle = time * 0.3;
      const stormOrbitX = jupiterX + Math.cos(stormAngle * 0.4) * (jupiterR * 0.38);
      const stormOrbitY = jupiterY + jupiterR * 0.32;
      const stormRad = jupiterR * 0.2;

      ctx.save();
      ctx.translate(stormOrbitX, stormOrbitY);
      ctx.rotate(stormAngle * 0.6);
      ctx.scale(1.4, 0.7);

      const stormGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, stormRad);
      stormGrad.addColorStop(0, "#C8FF45");
      stormGrad.addColorStop(0.4, "#10B981");
      stormGrad.addColorStop(0.75, "#064E3B");
      stormGrad.addColorStop(1, "rgba(4, 32, 19, 0)");

      ctx.fillStyle = stormGrad;
      ctx.beginPath();
      ctx.arc(0, 0, stormRad, 0, Math.PI * 2);
      ctx.fill();

      // Concentric eye rings
      ctx.strokeStyle = "rgba(200, 255, 69, 0.45)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, stormRad * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, stormRad * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── E. 3D Spherical Sunlight Shading & Terminator ──
      const sunGrad = ctx.createRadialGradient(
        jupiterX - jupiterR * 0.45,
        jupiterY - jupiterR * 0.45,
        jupiterR * 0.2,
        jupiterX + jupiterR * 0.35,
        jupiterY + jupiterR * 0.35,
        jupiterR * 1.15
      );
      sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      sunGrad.addColorStop(0.4, "rgba(0, 0, 0, 0)");
      sunGrad.addColorStop(0.78, "rgba(2, 12, 7, 0.65)");
      sunGrad.addColorStop(1, "rgba(2, 10, 6, 0.95)");

      ctx.fillStyle = sunGrad;
      ctx.fillRect(jupiterX - jupiterR, jupiterY - jupiterR, jupiterR * 2, jupiterR * 2);

      // ── F. Atmospheric Limb Glowing Edge ──
      const limbGrad = ctx.createRadialGradient(
        jupiterX,
        jupiterY,
        jupiterR * 0.88,
        jupiterX,
        jupiterY,
        jupiterR
      );
      limbGrad.addColorStop(0, "rgba(200, 255, 69, 0)");
      limbGrad.addColorStop(0.75, "rgba(200, 255, 69, 0.35)");
      limbGrad.addColorStop(1, "rgba(34, 211, 238, 0.65)");

      ctx.fillStyle = limbGrad;
      ctx.fillRect(jupiterX - jupiterR, jupiterY - jupiterR, jupiterR * 2, jupiterR * 2);
      ctx.restore(); // End clipping

      // ── G. Front Tilted Planetary Dust Ring (in front of planet) ──
      ctx.save();
      ctx.translate(jupiterX, jupiterY);
      ctx.rotate(-0.35);
      ctx.scale(1, 0.26);

      ctx.beginPath();
      ctx.arc(0, 0, jupiterR * 1.7, 0, Math.PI, false); // bottom half (front of planet)
      ctx.lineWidth = 18;
      const frontRingGrad = ctx.createLinearGradient(-jupiterR * 1.7, 0, jupiterR * 1.7, 0);
      frontRingGrad.addColorStop(0, "rgba(34, 211, 238, 0.3)");
      frontRingGrad.addColorStop(0.5, "rgba(200, 255, 69, 0.85)");
      frontRingGrad.addColorStop(1, "rgba(34, 211, 238, 0.3)");
      ctx.strokeStyle = frontRingGrad;
      ctx.shadowColor = "#C8FF45";
      ctx.shadowBlur = 24;
      ctx.stroke();

      // Front inner fine ring
      ctx.beginPath();
      ctx.arc(0, 0, jupiterR * 1.5, 0, Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(200, 255, 69, 0.75)";
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // End global alpha

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
