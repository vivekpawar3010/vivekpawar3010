"use client";

import { useEffect, useRef } from "react";

export default function Interactive3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const onMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetRotY = ((e.clientX - halfW) / halfW) * 0.45;
      targetRotX = ((e.clientY - halfH) / halfH) * 0.45;
    };

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);

    // ─── 3D Outer Polyhedron Geometry (Golden Ratio Crystal) ────────────────
    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = Math.min(width, height) * 0.22;

    const baseVertices = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ].map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len * scale, y / len * scale, z / len * scale];
    });

    // Edges connecting vertices within distance threshold
    const edges = [];
    for (let i = 0; i < baseVertices.length; i++) {
      for (let j = i + 1; j < baseVertices.length; j++) {
        const d = Math.hypot(
          baseVertices[i][0] - baseVertices[j][0],
          baseVertices[i][1] - baseVertices[j][1],
          baseVertices[i][2] - baseVertices[j][2]
        );
        if (d < scale * 1.15) {
          edges.push([i, j]);
        }
      }
    }

    // ─── Inner Concentric Core (Nested Octahedron) ──────────────────────────
    const innerScale = scale * 0.52;
    const innerVertices = [
      [ 1,  0,  0], [-1,  0,  0],
      [ 0,  1,  0], [ 0, -1,  0],
      [ 0,  0,  1], [ 0,  0, -1]
    ].map(([x, y, z]) => [x * innerScale, y * innerScale, z * innerScale]);

    const innerEdges = [
      [0, 2], [2, 1], [1, 3], [3, 0], // equator
      [4, 0], [4, 1], [4, 2], [4, 3], // top pyramid
      [5, 0], [5, 1], [5, 2], [5, 3]  // bottom pyramid
    ];

    // ─── 3D Starfield / Particles ──────────────────────────────────────────
    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * width * 1.6,
      y: (Math.random() - 0.5) * height * 1.6,
      z: (Math.random() - 0.5) * 600,
      radius: Math.random() * 1.9 + 0.6,
      isPrimary: Math.random() > 0.45,
    }));

    // Projection constants
    const FOCAL_LENGTH = 700;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Check active theme for dynamic color harmony
      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // Rotation angles
      angle += 0.0045;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const currentRotX = rotX + Math.sin(angle * 0.7) * 0.15;
      const currentRotY = rotY + angle;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      // Rotate vertex helper
      const project = (x, y, z, cx, cy) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX + 500;

        const f = FOCAL_LENGTH / (FOCAL_LENGTH + z2);
        return {
          px: cx + x1 * f,
          py: cy + y2 * f,
          scale: f,
          depth: z2,
        };
      };

      // ── Draw background 3D particles ──
      particles.forEach((p) => {
        p.z -= 0.6;
        if (p.z < -300) p.z = 300;

        const proj = project(p.x, p.y, p.z, width * 0.5, height * 0.5);
        if (proj.scale > 0) {
          const alpha = Math.max(0.08, Math.min(0.48, (600 - proj.depth) / 600));
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, p.radius * proj.scale, 0, Math.PI * 2);
          
          if (isLight) {
            ctx.fillStyle = p.isPrimary
              ? `rgba(2, 132, 199, ${alpha * 0.85})`
              : `rgba(124, 58, 237, ${alpha * 0.75})`;
          } else {
            ctx.fillStyle = p.isPrimary
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(139, 92, 246, ${alpha})`;
          }
          ctx.fill();
        }
      });

      // ── Position Polyhedron (Right on desktop, centered on mobile) ──
      const crystalCenterX = width > 900 ? width * 0.82 : width * 0.5;
      const crystalCenterY = width > 900 ? height * 0.38 : height * 0.32;

      // ── Draw Inner Nested Octahedron (Opposite Spin) ──
      const innerRotX = -currentRotX * 1.3;
      const innerRotY = -currentRotY * 1.3;
      const icosX = Math.cos(innerRotX);
      const isinX = Math.sin(innerRotX);
      const icosY = Math.cos(innerRotY);
      const isinY = Math.sin(innerRotY);

      const projectInner = (x, y, z) => {
        const x1 = x * icosY - z * isinY;
        const z1 = z * icosY + x * isinY;
        const y2 = y * icosX - z1 * isinX;
        const z2 = z1 * icosX + y * isinX + 500;
        const f = FOCAL_LENGTH / (FOCAL_LENGTH + z2);
        return {
          px: crystalCenterX + x1 * f,
          py: crystalCenterY + y2 * f,
          scale: f,
          depth: z2,
        };
      };

      const innerProjected = innerVertices.map(([vx, vy, vz]) => projectInner(vx, vy, vz));

      innerEdges.forEach(([i, j]) => {
        const p1 = innerProjected[i];
        const p2 = innerProjected[j];
        if (p1 && p2) {
          const avgDepth = (p1.depth + p2.depth) / 2;
          const alpha = Math.max(0.08, Math.min(0.45, (800 - avgDepth) / 500));
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.strokeStyle = isLight
            ? `rgba(124, 58, 237, ${alpha * 1.1})`
            : `rgba(192, 132, 252, ${alpha * 0.95})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      });

      // ── Draw Outer Rotating Polyhedron ──
      const projectedVertices = baseVertices.map(([vx, vy, vz]) =>
        project(vx, vy, vz, crystalCenterX, crystalCenterY)
      );

      // Edges
      edges.forEach(([i, j]) => {
        const p1 = projectedVertices[i];
        const p2 = projectedVertices[j];
        if (p1 && p2) {
          const avgDepth = (p1.depth + p2.depth) / 2;
          const alpha = Math.max(0.08, Math.min(0.48, (800 - avgDepth) / 500));

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.strokeStyle = isLight
            ? `rgba(2, 132, 199, ${alpha * 1.3})`
            : `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      });

      // Vertex nodes
      projectedVertices.forEach((p) => {
        const alpha = Math.max(0.2, Math.min(0.75, (800 - p.depth) / 450));
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.6 * p.scale, 0, Math.PI * 2);
        
        if (isLight) {
          ctx.fillStyle = `rgba(67, 56, 202, ${alpha * 1.2})`;
          ctx.shadowColor = "#0284c7";
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 9;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        opacity: 0.9,
      }}
    />
  );
}
