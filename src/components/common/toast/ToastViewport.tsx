"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ToastItem } from "@/components/common/toast/types";

interface ToastViewportProps {
  toasts: ToastItem[];
}

const variantClassMap = {
  success: "bg-[#3a3a3a]/95 text-white border-[#555555]",
  error: "bg-[#6b3d3d]/95 text-white border-[#8a5454]",
  info: "bg-[#484848]/95 text-white border-[#636363]",
};

export default function ToastViewport({ toasts }: ToastViewportProps) {
  if (toasts.length === 0) return null;
  const toast = toasts[toasts.length - 1];

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-1/2 z-[11000] w-[calc(100%-2rem)] max-w-[393px] -translate-x-1/2"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`rounded-xl border px-4 py-3 text-center text-sm shadow-lg backdrop-blur-sm ${variantClassMap[toast.variant]}`}
        >
          {toast.message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
