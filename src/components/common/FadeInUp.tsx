"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUpVariants } from "@/lib/animations/fadeInUp";

interface FadeInUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export default function FadeInUp({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.2,
}: FadeInUpProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fadeInUpVariants}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}
