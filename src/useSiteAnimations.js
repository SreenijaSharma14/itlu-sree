
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";

export default function useSiteAnimations() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      // TITLES: gentle, continuous floating effect.
      const titleElements = gsap.utils.toArray(
        ".hero-content h1, " +
        ".section-heading, " +
        ".account-heading, " +
        ".my-orders-heading h1"
      );

      titleElements.forEach((title, index) => {
        gsap.to(title, {
          y: -4,
          duration: 3.5 + index * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, [pathname]);
}
