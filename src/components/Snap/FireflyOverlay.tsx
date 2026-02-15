"use client";

import { motion, useReducedMotion } from "framer-motion";

interface FireflyParticle {
  id: string;
  left: number;
  size: number;
  rise: number;
  drift: number;
  duration: number;
  delay: number;
  repeatDelay: number;
  depth: number;
  blur: number;
  baseScale: number;
  opacityPeak: number;
  strongGlow: boolean;
}

const PARTICLES: FireflyParticle[] = [
  {
    id: "firefly-1",
    left: 16,
    size: 5,
    rise: 88,
    drift: 8,
    duration: 4.2,
    delay: 0.2,
    repeatDelay: 0.8,
    depth: 36,
    blur: 0.2,
    baseScale: 1.05,
    opacityPeak: 0.84,
    strongGlow: true,
  },
  {
    id: "firefly-2",
    left: 29,
    size: 4,
    rise: 78,
    drift: -6,
    duration: 3.8,
    delay: 1.3,
    repeatDelay: 0.5,
    depth: 24,
    blur: 0.35,
    baseScale: 0.98,
    opacityPeak: 0.74,
    strongGlow: false,
  },
  {
    id: "firefly-3",
    left: 44,
    size: 3,
    rise: 66,
    drift: 5,
    duration: 3.2,
    delay: 0.6,
    repeatDelay: 0.7,
    depth: 10,
    blur: 0.6,
    baseScale: 0.92,
    opacityPeak: 0.64,
    strongGlow: false,
  },
  {
    id: "firefly-4",
    left: 56,
    size: 4,
    rise: 84,
    drift: -7,
    duration: 4.1,
    delay: 1.8,
    repeatDelay: 0.6,
    depth: 30,
    blur: 0.25,
    baseScale: 1.02,
    opacityPeak: 0.78,
    strongGlow: true,
  },
  {
    id: "firefly-5",
    left: 66,
    size: 3,
    rise: 71,
    drift: 4,
    duration: 3.5,
    delay: 0.4,
    repeatDelay: 0.9,
    depth: 8,
    blur: 0.7,
    baseScale: 0.9,
    opacityPeak: 0.58,
    strongGlow: false,
  },
  {
    id: "firefly-6",
    left: 74,
    size: 5,
    rise: 90,
    drift: -8,
    duration: 4.0,
    delay: 1.1,
    repeatDelay: 0.7,
    depth: 34,
    blur: 0.2,
    baseScale: 1.08,
    opacityPeak: 0.86,
    strongGlow: true,
  },
  {
    id: "firefly-7",
    left: 84,
    size: 2,
    rise: 60,
    drift: 4,
    duration: 2.9,
    delay: 0.9,
    repeatDelay: 0.8,
    depth: 6,
    blur: 0.8,
    baseScale: 0.88,
    opacityPeak: 0.5,
    strongGlow: false,
  },
  {
    id: "firefly-8",
    left: 22,
    size: 2,
    rise: 63,
    drift: -4,
    duration: 2.8,
    delay: 1.9,
    repeatDelay: 0.6,
    depth: 12,
    blur: 0.75,
    baseScale: 0.9,
    opacityPeak: 0.52,
    strongGlow: false,
  },
  {
    id: "firefly-9",
    left: 48,
    size: 3,
    rise: 75,
    drift: 6,
    duration: 3.6,
    delay: 2.2,
    repeatDelay: 0.7,
    depth: 18,
    blur: 0.5,
    baseScale: 0.96,
    opacityPeak: 0.6,
    strongGlow: false,
  },
  {
    id: "firefly-10",
    left: 62,
    size: 4,
    rise: 82,
    drift: -5,
    duration: 3.9,
    delay: 2.6,
    repeatDelay: 0.8,
    depth: 26,
    blur: 0.3,
    baseScale: 1.0,
    opacityPeak: 0.7,
    strongGlow: false,
  },
];

export default function FireflyOverlay() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-[22px]"
      style={{ perspective: "700px", transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      {PARTICLES.map((particle) => {
        const glowColor = particle.strongGlow
          ? "rgba(124, 255, 138, 0.35)"
          : "rgba(91, 239, 118, 0.2)";
        const baseColor = particle.strongGlow ? "#7CFF8A" : "#5BEF76";

        return (
          <div
            key={particle.id}
            className="absolute bottom-2"
            style={{
              left: `${particle.left}%`,
              filter: `blur(${particle.blur}px)`,
              transform: `translateX(-50%) translateZ(${particle.depth}px) scale(${particle.baseScale})`,
              transformStyle: "preserve-3d",
              willChange: "transform, filter",
            }}
          >
            <motion.span
              className="block rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: baseColor,
                boxShadow: `0 0 ${particle.strongGlow ? 13 : 8}px ${glowColor}`,
                willChange: "transform, opacity, filter",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.9 }}
              animate={{
                x: [0, particle.drift, 0],
                y: [0, -particle.rise],
                opacity: [
                  0,
                  particle.opacityPeak,
                  particle.opacityPeak * 0.4,
                  0,
                ],
                scale: [0.92, 1.08, 0.96],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: particle.repeatDelay,
                ease: "easeInOut",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
