"use client";

import { useEffect } from "react";

export default function ScrollResetProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { history } = window;
    const prevScrollRestoration = history.scrollRestoration;

    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      history.scrollRestoration = prevScrollRestoration;
    };
  }, []);

  return null;
}
