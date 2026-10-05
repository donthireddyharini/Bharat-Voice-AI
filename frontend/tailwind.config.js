/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#030712",          // Deepest obsidian cosmos
        panel: "#0B1329",         // Rich midnight sapphire crystal
        panel2: "#0F1A3A",        // Luminous deep space navy
        saffron: "#FF7800",       // Solar imperial saffron (rich, luminous, majestic)
        "saffron-light": "#FFA043",
        gulal: "#FF2E79",         // Hyper radiant rose-magenta glow
        amethyst: "#8040F5",      // Royal interstellar violet
        mist: "#94A3B8",          // Pure crisp slate mist
        bone: "#F8FAFC",          // Ultra-clean diamond white
        neon: "#00E5FF",          // Electric cyan laser
        electric: "#4338CA",      // Deep electric ultramarine
        cyber: "#00F5A0",         // Radiant emerald aurora
        aurora: "#2DD4BF",        // Sea-foam cyan
        gold: "#FFB703",          // Royal Bharat gold
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 50px -10px rgba(255, 120, 0, 0.45)",
        glowPink: "0 0 50px -10px rgba(255, 46, 121, 0.45)",
        glowPurple: "0 0 50px -10px rgba(128, 64, 245, 0.45)",
        glowCyan: "0 0 50px -10px rgba(0, 229, 255, 0.45)",
        glowNeon: "0 0 35px rgba(0, 229, 255, 0.6)",
        glow3D: "-10px 10px 35px -5px rgba(128, 64, 245, 0.35), 10px -10px 35px -5px rgba(0, 229, 255, 0.35)",
        masterpiece: "0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(255, 120, 0, 0.25)",
      },
      backgroundSize: {
        "300%": "300% 300%",
        "200%": "200% 200%",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px) rotateX(2deg)" },
          "50%": { transform: "translateY(-14px) rotateX(-2deg)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        spinSlowReverse: {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        particleFloat: {
          "0%, 100%": { transform: "translate(0,0)" },
          "33%": { transform: "translate(6px,-10px)" },
          "66%": { transform: "translate(-8px,6px)" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        orbit: {
          "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
        },
        orbitReverse: {
          "0%": { transform: "translate(-50%, -50%) rotate(360deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(0deg)" },
        },
        morphBlob: {
          "0%": { borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" },
          "100%": { borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%) rotate(30deg)" },
          "100%": { transform: "translateX(200%) rotate(30deg)" },
        },
        typewriter: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        borderGlow: {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        float3D: {
          "0%, 100%": { transform: "translateY(0) translateZ(0) rotateX(0) rotateY(0)" },
          "50%": { transform: "translateY(-10px) translateZ(20px) rotateX(2deg) rotateY(2deg)" },
        },
        particleRise: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        auroraBlob1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(60px, 40px) scale(1.15)" },
        },
        auroraBlob2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-50px, 60px) scale(1.12)" },
        },
        auroraBlob3: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(40px, -50px) scale(1.08)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        spinSlow: "spinSlow 18s linear infinite",
        spinSlowReverse: "spinSlowReverse 24s linear infinite",
        pulseRing: "pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        particleFloat: "particleFloat 5s ease-in-out infinite",
        waveform: "waveform 1s ease-in-out infinite",
        orbit: "orbit 20s linear infinite",
        orbitReverse: "orbitReverse 20s linear infinite",
        morphBlob: "morphBlob 8s ease-in-out infinite alternate",
        shimmer: "shimmer 2.5s linear infinite",
        typewriter: "typewriter 1s steps(2, start) infinite",
        borderGlow: "borderGlow 4s linear infinite",
        float3D: "float3D 6s ease-in-out infinite",
        "float-3d": "float3D 6s ease-in-out infinite",
        particleRise: "particleRise 20s linear infinite",
        gradientShift: "gradientShift 4s ease infinite",
        "gradient-x": "gradientShift 4s ease infinite",
        scaleIn: "scaleIn 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        slideUp: "slideUp 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        breathe: "breathe 4s ease-in-out infinite",
        ripple: "ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        auroraBlob1: "auroraBlob1 18s ease-in-out infinite",
        auroraBlob2: "auroraBlob2 22s ease-in-out infinite",
        auroraBlob3: "auroraBlob3 25s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
