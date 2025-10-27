import Lenis from "lenis";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Initialize a new Lenis instance for smooth scrolling with performance optimizations
const lenis = new Lenis({
  duration: 1.2, // Duration of scroll animation
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false, // Disable smooth touch for better mobile performance
  touchMultiplier: 2,
});

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on("scroll", ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
let lastTime = 0;
const throttleInterval = 1000 / 60; // 60 FPS maximum

gsap.ticker.add((time) => {
  const now = performance.now();
  // Throttle updates to 60 FPS to reduce CPU usage
  if (now - lastTime >= throttleInterval) {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
    lastTime = now;
  }
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

// Optimize ticker for better performance
gsap.ticker.target = "auto"; // Let GSAP manage frame rate

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("lenis", lenis);
  // scroll to top on route change
});
