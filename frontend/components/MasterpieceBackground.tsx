"use client";

import { useEffect, useRef } from "react";

export default function MasterpieceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Smooth cursor interpolation
    const mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let t = 0;

    // Silk Wave parameters
    const waves = [
      { speed: 0.007, amplitude: 55, wavelength: 0.0018, color: "rgba(255, 120, 0, 0.07)", yRatio: 0.35 },
      { speed: 0.005, amplitude: 75, wavelength: 0.0014, color: "rgba(124, 58, 237, 0.08)", yRatio: 0.5 },
      { speed: 0.009, amplitude: 45, wavelength: 0.0022, color: "rgba(6, 182, 212, 0.06)", yRatio: 0.65 },
      { speed: 0.006, amplitude: 65, wavelength: 0.0016, color: "rgba(255, 46, 121, 0.05)", yRatio: 0.78 },
    ];

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Interactive Cursor Light Pool
      if (mouse.x > -500 && mouse.y > -500) {
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320);
        cursorGlow.addColorStop(0, "rgba(255, 120, 0, 0.09)");
        cursorGlow.addColorStop(0.4, "rgba(124, 58, 237, 0.04)");
        cursorGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Flowing Silk Waves
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w];
        ctx.beginPath();
        ctx.moveTo(0, height);

        const baseY = height * wave.yRatio;

        for (let x = 0; x <= width; x += 15) {
          // Complex harmonic sine wave calculation
          const sin1 = Math.sin(x * wave.wavelength + t * wave.speed);
          const cos1 = Math.cos(x * wave.wavelength * 0.6 + t * wave.speed * 0.7);
          const y = baseY + (sin1 + cos1) * wave.amplitude;

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, height);
        grad.addColorStop(0, wave.color);
        grad.addColorStop(0.7, "rgba(4, 7, 20, 0.01)");
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fill();

        // Wave crest glow line
        ctx.strokeStyle = wave.color.replace(/0\.\d+\)/, "0.22)");
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const sin1 = Math.sin(x * wave.wavelength + t * wave.speed);
          const cos1 = Math.cos(x * wave.wavelength * 0.6 + t * wave.speed * 0.7);
          const y = baseY + (sin1 + cos1) * wave.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040714] select-none">
      {/* 1. Luminous Deep Space Aurora Radiance */}
      <div 
        className="absolute -top-[20%] left-[10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(255, 120, 0, 0.35) 0%, rgba(255, 46, 121, 0.15) 50%, transparent 70%)"
        }}
      />
      
      <div 
        className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(6, 182, 212, 0.18) 50%, transparent 70%)"
        }}
      />

      <div 
        className="absolute -bottom-[20%] left-[30%] w-[55vw] h-[55vw] rounded-full blur-[160px] opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%)"
        }}
      />

      {/* 2. Precision Cyber Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)"
        }}
      />

      {/* 3. Fluid Silk Wave Canvas & Interactive Cursor Halo */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 4. Film Noir Cinematic Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(4, 7, 20, 0.8) 100%)"
        }}
      />
    </div>
  );
}
