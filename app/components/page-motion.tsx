"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { createDirector } from "../lib/director";

export default function PageMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    html.classList.toggle("scroll-directed", !reducedMotion.matches);
    let needsRender = true;
    let frame = 0;
    let disposed = false;

    function scheduleRender() {
      if (!disposed) needsRender = true;
    }

    const director = createDirector();
    const lenis = new Lenis({
      // One clock advances scroll and paints the director together.
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      respectReducedMotion: true,
      prevent: (node) => node.closest("dialog") !== null,
      // Handle same-page anchors below so URL history and focus remain native-like.
      anchors: false,
    });

    // One-time entrances: the ticket wipes in; archive frames develop as they arrive.
    const elements = document.querySelectorAll<HTMLElement>(".reveal, [data-develop]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in", "is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" },
    );
    elements.forEach((element) => {
      // Content stays visible without JavaScript. Only prepare elements below the fold.
      if (
        !reducedMotion.matches &&
        element.getBoundingClientRect().top > window.innerHeight
      )
        element.classList.add(element.matches(".reveal") ? "reveal-ready" : "develop-ready");
      observer.observe(element);
    });

    // The stage light follows whichever chapter has the stage.
    const cards = document.querySelectorAll<HTMLElement>(".chapter-card");
    const lights = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-live", entry.isIntersecting),
        );
      },
      { rootMargin: "-25% 0px -25% 0px" },
    );
    cards.forEach((card) => lights.observe(card));

    function updateMotionPreference() {
      html.classList.toggle("scroll-directed", !reducedMotion.matches);
      if (reducedMotion.matches) {
        director.reset();
        elements.forEach((element) => {
          element.classList.add("is-visible", "is-in");
          observer.unobserve(element);
        });
      }
      director.invalidate();
      scheduleRender();
    }

    function tick(time: number) {
      if (disposed) return;
      // Lenis emits scroll synchronously from raf(), which marks this frame dirty.
      lenis.raf(time);
      if (needsRender) {
        needsRender = false;
        if (!reducedMotion.matches) director.update();
      }
      frame = requestAnimationFrame(tick);
    }

    function focusAnchor(target: HTMLElement) {
      const needsTabIndex =
        !target.hasAttribute("tabindex") && target.tabIndex < 0;
      if (needsTabIndex) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (needsTabIndex) {
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      }
    }

    function handleAnchor(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link || link.download || (link.target && link.target !== "_self"))
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search ||
        !url.hash
      )
        return;
      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      } catch {
        return;
      }
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, "", url.hash);
      }
      const destination = target;
      // A native keyboard/browser scroll can precede its scroll event. Sync the
      // actual position before Lenis measures the anchor destination.
      lenis.resize();
      lenis.scrollTo(destination, {
        // Enter/keyboard navigation stays instant, as does reduced motion.
        immediate: event.detail === 0 || reducedMotion.matches,
        onComplete: () => focusAnchor(destination),
      });
    }

    let wasScrollLocked = false;
    function updateScrollLock() {
      const locked =
        html.classList.contains("splash-on") && !html.classList.contains("splash-done")
          ? true
          : Boolean(document.querySelector("dialog[open]")) ||
            document.body.style.overflow === "hidden";
      if (locked && !lenis.isStopped) lenis.stop();
      else if (!locked && lenis.isStopped) lenis.start();
      if (locked !== wasScrollLocked) {
        wasScrollLocked = locked;
        director.invalidate();
      }
      scheduleRender();
    }

    const modalObserver = new MutationObserver(updateScrollLock);
    document.querySelectorAll("dialog").forEach((dialog) => {
      modalObserver.observe(dialog, {
        attributes: true,
        attributeFilter: ["open"],
      });
    });
    modalObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    modalObserver.observe(html, { attributes: true, attributeFilter: ["class"] });

    // Fonts and late images can move the layout; remeasure when they settle.
    function relayout() {
      director.invalidate();
      lenis.resize();
      scheduleRender();
    }
    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(document.body);
    document.fonts?.ready.then(relayout);

    const unsubscribeScroll = lenis.on("scroll", scheduleRender);
    reducedMotion.addEventListener("change", updateMotionPreference);
    document.addEventListener("click", handleAnchor);
    window.addEventListener("resize", relayout, { passive: true });
    updateScrollLock();
    updateMotionPreference();
    frame = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      lights.disconnect();
      modalObserver.disconnect();
      resizeObserver.disconnect();
      unsubscribeScroll();
      reducedMotion.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("click", handleAnchor);
      window.removeEventListener("resize", relayout);
      director.reset();
      html.classList.remove("scroll-directed");
      lenis.destroy();
    };
  }, []);
  return null;
}
