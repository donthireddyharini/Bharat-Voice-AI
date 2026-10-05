"use client";

import { useEffect, useRef, useState } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
  size: number;
  pulsePhase: number;
  label?: string;
}

const INDIAN_HUBS = [
  "New Delhi",
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "Kolkata",
  "Lucknow",
  "Jaipur",
  "Bhopal",
  "Patna",
  "Thiruvananthapuram",
  "Amaravati",
];

const COLORS = [
  "rgba(255, 122, 61, ", // Saffron
  "rgba(255, 77, 141, ", // Gulal
  "rgba(139, 92, 246, ", // Amethyst
  "rgba(0, 212, 255, ",  // Cyber Neon
  "rgba(6, 255, 165, ",  // Emerald
];

export default function Interactive3DScene({
  className = "",
  interactive = true,
  showLabels = true,
}: {
  className?: string;
  interactive?: boolean;
  showLabels?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false });
  const shockwavesRef = useRef<{ radius: number; maxRadius: number; x: number; y: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 3D points distributed on a Fibonacci Sphere
    const numPoints = 85;
    const sphereRadius = Math.min(width, height) * 0.38;
    const points: Point3D[] = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const px = x * sphereRadius;
      const py = y * sphereRadius;
      const pz = z * sphereRadius;

      points.push({
        x: px,
        y: py,
        z: pz,
        baseX: px,
        baseY: py,
        baseZ: pz,
        color: COLORS[i % COLORS.length],
        size: Math.random() * 2.5 + 2,
        pulsePhase: Math.random() * Math.PI * 2,
        label: i < INDIAN_HUBS.length && showLabels ? INDIAN_HUBS[i] : undefined,
      });
    }

    let rotX = 0.2;
    let rotY = 0.3;
    let rotSpeedX = 0.002;
    let rotSpeedY = 0.0035;

    // Animation Loop
    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse inertia
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      rotY += rotSpeedY + mouseRef.current.x * 0.0003;
      rotX += rotSpeedX + mouseRef.current.y * 0.0003;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 450;

      // Project 3D points to 2D
      const projected = points.map((p) => {
        // Rotate around Y
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotate around X
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.baseY * sinX;

        // Perspective scale
        const scale = fov / (fov + z2 + 300);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;
        const alpha = Math.max(0.12, Math.min(1, (z2 + sphereRadius) / (sphereRadius * 2)));

        return {
          ...p,
          screenX,
          screenY,
          scale,
          alpha,
          z2,
        };
      });

      // Sort by depth (painters algorithm)
      projected.sort((a, b) => a.z2 - b.z2);

      // Draw connecting neural lines between nearby nodes
      ctx.lineWidth = 1;
      const maxDistance = 75;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].screenX - projected[j].screenX;
          const dy = projected[i].screenY - projected[j].screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.28 * Math.min(projected[i].alpha, projected[j].alpha);
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].screenX, projected[i].screenY);
            ctx.lineTo(projected[j].screenX, projected[j].screenY);
            ctx.stroke();
          }
        }
      }

      // Draw dynamic shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 4;
        sw.alpha *= 0.94;

        if (sw.alpha < 0.02 || sw.radius > sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(255, 122, 61, ${sw.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#FF7A3D";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw glowing nodes and regional labels
      projected.forEach((p) => {
        const pulse = Math.sin(time * 0.003 + p.pulsePhase) * 0.5 + 0.5;
        const finalSize = p.size * p.scale * (1 + pulse * 0.35);

        // Core glow
        ctx.save();
        ctx.shadowColor = p.color + "0.8)";
        ctx.shadowBlur = 10 * p.scale;
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, Math.max(1, finalSize), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Optional Indian city / AI hub badge
        if (p.label && p.alpha > 0.65) {
          ctx.font = `600 ${Math.max(9, Math.round(11 * p.scale))}px Inter, sans-serif`;
          ctx.fillStyle = `rgba(243, 241, 250, ${p.alpha * 0.85})`;
          ctx.fillText(p.label, p.screenX + 8, p.screenY + 3);

          // Small indicator dot
          ctx.fillStyle = "rgba(0, 212, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(p.screenX + 5, p.screenY + 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Orbital Rings in 3D
      ctx.save();
      ctx.strokeStyle = "rgba(255, 122, 61, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, sphereRadius * 1.15, sphereRadius * 0.35, rotY * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(0, 212, 255, 0.16)";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, sphereRadius * 1.25, sphereRadius * 0.45, -rotX * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showLabels]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shockwavesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 180,
      alpha: 0.9,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => {
        setIsInteracting(false);
        mouseRef.current.targetX = 0;
        mouseRef.current.targetY = 0;
      }}
      className={`relative w-full h-full cursor-crosshair select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {interactive && (
        <div className="absolute bottom-4 left-6 pointer-events-none flex items-center gap-2 text-xs text-mist/70 bg-void/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-cyber animate-ping" />
          <span>Interactive 3D Bharat Neural Globe • Drag to rotate & Click to pulse</span>
        </div>
      )}
    </div>
  );
}
