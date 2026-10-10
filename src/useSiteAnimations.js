
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useSiteAnimations() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      // HERO: gentle entrance, no bouncing or blur
      const heroItems = gsap.utils.toArray(
        ".hero-content .eyebrow, .hero-content h1, .hero-content .hero-description, .hero-content .hero-actions, .hero-art"
      );

      gsap.fromTo(
        heroItems,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
          delay: 0.1,
          clearProps: "opacity,visibility,transform",
        }
      );

      // PRODUCT CARDS: soft rise as they enter the viewport
      const cards = gsap.utils.toArray(
        "#collection .product-card, .product-grid .product-card, .collection-grid .product-card, .related-card, .design-card"
      );

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 20, scale: 0.99 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: (index % 3) * 0.07,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );

        // Subtle card hover
        const enter = () => {
          gsap.to(card, {
            y: -3,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const leave = () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);

        card._itluCleanup = () => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        };
      });

      // SECTIONS: small movement, slower easing
      [".statement", ".custom-section", ".orders-section"].forEach(
        (selector) => {
          gsap.utils.toArray(selector).forEach((section) => {
            const content = section.querySelectorAll(
              ".eyebrow, h2, p, .custom-mark, .order-counter, .primary-button"
            );

            if (!content.length) return;

            gsap.fromTo(
              content,
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
                stagger: 0.08,
                ease: "power2.out",
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: section,
                  start: "top 85%",
                  toggleActions: "play none none none",
                  once: true,
                },
              }
            );
          });
        }
      );

      // FOOTER: understated upward reveal
      const footer = document.querySelector(".footer");

      if (footer) {
        const footerItems = footer.querySelectorAll(
          ".footer-logo, p, .footer-links"
        );

        gsap.fromTo(
          footerItems,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: footer,
              start: "top 95%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }

      // ABOUT: gentle hover, without moving the whole layout
      const about = document.querySelector("[data-about-section]");

      if (about) {
        const enter = () => {
          gsap.to(about, {
            y: -2,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const leave = () => {
          gsap.to(about, {
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        about.addEventListener("pointerenter", enter);
        about.addEventListener("pointerleave", leave);

        about._itluCleanup = () => {
          about.removeEventListener("pointerenter", enter);
          about.removeEventListener("pointerleave", leave);
        };
      }
    });

    const refreshTimer = window.setTimeout(
      () => ScrollTrigger.refresh(),
      250
    );

    return () => {
      window.clearTimeout(refreshTimer);

      document.querySelectorAll("*").forEach((element) => {
        element._itluCleanup?.();
        delete element._itluCleanup;
      });

      ctx.revert();
    };
  }, []);
}
