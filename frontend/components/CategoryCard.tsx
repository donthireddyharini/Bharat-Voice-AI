"use client";

import { useState, useRef } from "react";
import { CategoryItem } from "@/lib/types";

interface CategoryCardProps {
  category: CategoryItem;
  onClick?: (category: CategoryItem) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = ((y / rect.height) - 0.5) * -16;
    const rotY = ((x / rect.width) - 0.5) * 16;

    setTilt({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <button
      onClick={() => onClick?.(category)}
      className="text-left w-full group select-none block"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass rounded-2xl p-6 h-full border border-white/10 hover:border-saffron/60 transition-transform duration-200 ease-out relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-glow3D"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dynamic 3D Glare Sheen following cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 180px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-saffron/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div
          className="text-4xl mb-4 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-2xl"
          style={{ transform: "translateZ(25px)" }}
        >
          {category.icon}
        </div>
        
        <h3
          className="font-display font-semibold text-lg mb-2 text-bone group-hover:text-saffron transition-colors"
          style={{ transform: "translateZ(18px)" }}
        >
          {category.label}
        </h3>
        
        <p
          className="text-sm text-mist leading-relaxed"
          style={{ transform: "translateZ(10px)" }}
        >
          {category.description}
        </p>
        
        <div
          className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/5 text-xs text-saffron/90 group-hover:border-saffron/30 transition-colors"
          style={{ transform: "translateZ(14px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
          {category.doc_count} trusted records
        </div>
      </div>
    </button>
  );
}
