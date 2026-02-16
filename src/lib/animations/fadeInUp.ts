import type { Variants } from "framer-motion";

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      delay,
    },
  }),
};
