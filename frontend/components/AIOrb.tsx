"use client";

import { useState } from "react";
import { AssistantState } from "@/lib/types";

interface AIOrbProps {
  state?: AssistantState;
  size?: "lg" | "md" | "sm";
}

const STATE_LABEL: Record<AssistantState, string> = {
  idle: "",
  listening: "Listening…",
  understanding: "Understanding…",
  searching: "Searching trusted sources…",
  generating: "Preparing answer…",
  speaking: "Speaking…",
  error: "Let's try that again",
};

const SIZE_MAP = { lg: 340, md: 220, sm: 120 };

const CONSTELLATION = [
  { t: "10%", l: "20%", d: "0s", s: "3s" },
  { t: "15%", l: "80%", d: "0.2s", s: "4s" },
  { t: "30%", l: "10%", d: "0.5s", s: "3.5s" },
  { t: "80%", l: "15%", d: "0.1s", s: "4.2s" },
  { t: "90%", l: "75%", d: "0.8s", s: "3.8s" },
  { t: "70%", l: "90%", d: "0.3s", s: "4.5s" },
  { t: "20%", l: "50%", d: "1.1s", s: "3.2s" },
  { t: "85%", l: "45%", d: "0.6s", s: "3.7s" },
  { t: "50%", l: "5%", d: "0.9s", s: "4.1s" },
  { t: "45%", l: "95%", d: "1.2s", s: "3.9s" },
  { t: "5%", l: "40%", d: "0.4s", s: "4.3s" },
  { t: "60%", l: "25%", d: "0.7s", s: "3.6s" },
  { t: "65%", l: "85%", d: "1.0s", s: "4.0s" },
  { t: "40%", l: "20%", d: "1.3s", s: "3.4s" },
];

export default function AIOrb({ state = "idle", size = "lg" }: AIOrbProps) {
  const px = size === "lg" ? "min(340px, 78vw)" : size === "md" ? "min(220px, 58vw)" : "min(120px, 32vw)";
  const isActive = state !== "idle";
  const isError = state === "error";

  // Dynamic values based on state
  const getSpeedMultiplier = (s: AssistantState) => {
    switch (s) {
      case "idle": return 1;
      case "listening": return 0.5;
      case "understanding": return 0.35;
      case "searching": return 0.2;
      case "generating": return 0.1;
      case "speaking": return 0.4;
      case "error": return 1.5;
      default: return 1;
    }
  };

  const m = getSpeedMultiplier(state);

  const getCoreGradient = (s: AssistantState) => {
    switch (s) {
      case "listening": return "radial-gradient(circle at 35% 30%, #a5f3fc, #00D4FF 40%, #0284c7 80%)";
      case "searching": return "radial-gradient(circle at 35% 30%, #818cf8, #4F46E5 40%, #312e81 80%)";
      case "generating": return "radial-gradient(circle at 35% 30%, #c4b5fd, #8B5CF6 30%, #00D4FF 70%)";
      case "error": return "radial-gradient(circle at 35% 30%, #fca5a5, #ef4444 40%, #7f1d1d 80%)";
      case "idle":
      case "speaking":
      case "understanding":
      default:
        return "radial-gradient(circle at 35% 30%, #ffd9b8, #FF7A3D 35%, #FF4D8D 65%, #8B5CF6 100%)";
    }
  };

  const getGlowHalo = (s: AssistantState) => {
    switch (s) {
      case "listening": return "0 0 80px -10px rgba(0,212,255,0.6), 0 0 160px -20px rgba(0,212,255,0.3)";
      case "searching": return "0 0 80px -10px rgba(79,70,229,0.6), 0 0 160px -20px rgba(79,70,229,0.3)";
      case "generating": return "0 0 80px -10px rgba(139,92,246,0.6), 0 0 160px -20px rgba(0,212,255,0.3)";
      case "error": return "0 0 80px -10px rgba(239,68,68,0.6), 0 0 160px -20px rgba(185,28,28,0.3)";
      case "idle":
      case "speaking":
      case "understanding":
      default:
        return "0 0 90px -10px rgba(255,122,61,0.55), 0 0 140px -20px rgba(139,92,246,0.4)";
    }
  };

  const getRingColors = (s: AssistantState) => {
    switch (s) {
      case "listening": return ["#00D4FF", "#a5f3fc", "#0891b2", "#22d3ee", "#06b6d4"];
      case "searching": return ["#4F46E5", "#818cf8", "#3730a3", "#6366f1", "#4338ca"];
      case "generating": return ["#8B5CF6", "#c4b5fd", "#5b21b6", "#a855f7", "#00D4FF"];
      case "error": return ["#ef4444", "#fca5a5", "#991b1b", "#f87171", "#b91c1c"];
      default: return ["#FF7A3D", "#FF4D8D", "#8B5CF6", "#F59E0B", "#D946EF"];
    }
  };

  const ringColors = getRingColors(state);

  const RINGS = [
    { inset: 0, rx: 65, ry: 10, rz: 0, baseDur: 18, reverse: false },
    { inset: 8, rx: 70, ry: -15, rz: 30, baseDur: 22, reverse: true },
    { inset: 16, rx: 55, ry: 20, rz: 60, baseDur: 26, reverse: false },
    { inset: 22, rx: 75, ry: -10, rz: 90, baseDur: 30, reverse: true },
    { inset: 28, rx: 60, ry: 15, rz: 120, baseDur: 34, reverse: false },
  ];

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -28; // tilt X
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 28;  // tilt Y
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative perspective-container cursor-pointer transition-transform duration-300 ease-out"
        style={{
          width: px,
          height: px,
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.04, 1.04, 1.04)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {clicked && (
          <span className="absolute inset-[-20%] rounded-full border-2 border-saffron animate-ping pointer-events-none" />
        )}
        {/* Outer listening pulse */}
        {state === "listening" && (
          <>
            <span className="absolute inset-[-10%] rounded-full border-2 border-cyan-400/60 animate-pulseRing" />
            <span className="absolute inset-[-10%] rounded-full border-2 border-cyan-400/40 animate-pulseRing" style={{ animationDelay: "0.6s" }} />
          </>
        )}

        {/* Floating particles constellation */}
        {CONSTELLATION.map((particle, i) => (
          <span
            key={`p-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/70 animate-breathe"
            style={{
              top: particle.t,
              left: particle.l,
              animationDelay: particle.d,
              animationDuration: particle.s,
              opacity: 0.6,
              boxShadow: "0 0 6px 1px rgba(255,255,255,0.4)",
            }}
          />
        ))}

        {/* 5 Layered 3D Rings with Particle Trails */}
        {RINGS.map((ring, i) => {
          const color = ringColors[i];
          const dur = Math.max(ring.baseDur * m, 1.5);
          const animationName = ring.reverse ? "orbitReverse" : "orbit";
          return (
            <div
              key={`ring-${i}`}
              className="absolute transition-all duration-700 ease-in-out"
              style={{
                inset: `${ring.inset}%`,
                transform: `rotateX(${ring.rx}deg) rotateY(${ring.ry}deg) rotateZ(${ring.rz}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="absolute inset-0 rounded-full border-[1.5px]"
                style={{
                  borderColor: `${color}40`, // 40 hex is ~25% opacity
                  animation: `${animationName} ${dur}s linear infinite`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Orbital Particle Trail */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: color,
                    boxShadow: `0 0 16px 3px ${color}`,
                    top: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Dynamic Glowing Core */}
        <div
          className={`absolute inset-[32%] rounded-full transition-all duration-700 ease-in-out ${isActive ? "animate-breathe" : "animate-breathe"}`}
          style={{
            background: getCoreGradient(state),
            boxShadow: getGlowHalo(state),
            transform: state === "listening" ? "scale(1.1)" : "scale(1)",
          }}
        >
          {/* Sound Wave Visualization (7 bars) */}
          {state === "speaking" && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 mix-blend-overlay">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-white/90 animate-waveform"
                  style={{
                    height: `${25 + (i % 3) * 10}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${0.6 + (i % 2) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Generating Loader */}
          {state === "generating" && (
            <div
              className="absolute inset-[20%] rounded-full border-4 border-white/60 border-t-transparent animate-orbit"
              style={{ animationDuration: "1s" }}
            />
          )}
        </div>
      </div>

      {/* State Label */}
      <div className="h-6 mt-4">
        {STATE_LABEL[state] && (
          <p className={`font-body text-base tracking-wide transition-colors duration-500 ${isError ? "text-red-400 font-medium" : "text-gray-300"}`}>
            {STATE_LABEL[state]}
          </p>
        )}
      </div>
    </div>
  );
}
