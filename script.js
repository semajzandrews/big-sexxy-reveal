import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(SplitText, ScrollTrigger);

/* ---------- smooth scroll ---------- */

const lenis = new Lenis({ anchors: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- order card ---------- */

const PRICE = 10;
const qtyValue = document.querySelector(".qty-value");
const orderTotal = document.querySelector(".order-total");
const orderBtn = document.querySelector(".order-btn");
let qty = 1;

document.querySelectorAll(".qty-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    qty = Math.min(24, Math.max(1, qty + Number(btn.dataset.qty)));
    qtyValue.textContent = qty;
    orderTotal.textContent = `Total: $${qty * PRICE}`;
    const noun = qty === 1 ? "bottle" : "bottles";
    orderBtn.href = `mailto:orders@bigsexxyhotsauce.com?subject=Big%20Sexxy%20Order&body=${encodeURIComponent(
      `I want ${qty} ${noun} of the Signature Blend.`,
    )}`;
  });
});

/* ---------- mobile nav ---------- */

const nav = document.querySelector("nav");
const navToggle = document.querySelector(".nav-toggle");

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});

document.querySelectorAll(".nav-items a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- intro reveal ---------- */

document.fonts.ready.then(() => {
  const navLinks = SplitText.create(".nav-items a", {
    type: "words",
    mask: "words",
    wordsClass: "nav-word",
  });

  const heading = SplitText.create(".hero-header h1", {
    type: "lines, words, chars",
    charsClass: "char",
    wordsClass: "word",
  });

  const footerText = SplitText.create(".hero-footer p", {
    type: "lines",
    mask: "lines",
    linesClass: "footer-line",
  });

  gsap.set(".nav-logo img", { scale: 0 });
  gsap.set(navLinks.words, { yPercent: 100 });
  gsap.set(heading.chars, { y: 50, opacity: 0, scale: 0.5 });
  gsap.set(footerText.lines, { yPercent: 100 });

  const itemTargets = [
    { x: "-20vw", y: "-30vh", rotation: -20 },
    { x: "25vw", y: "-20vh", rotation: 15 },
    { x: "-32vw", y: "30vh", rotation: 12 },
    { x: "15vw", y: "25vh", rotation: -15 },
  ];

  const EXIT_DISTANCE = 3.5;
  const itemExits = itemTargets.map((target) => ({
    x: parseFloat(target.x) * EXIT_DISTANCE + "vw",
    y: parseFloat(target.y) * EXIT_DISTANCE + "vh",
    rotation: target.rotation * 2.5,
  }));

  const items = gsap.utils.toArray(".item");
  const floatingTweens = [];

  const tl = gsap.timeline({ delay: 0.5 });

  tl.to(".preloader-revealer", {
    clipPath: "circle(100% at 50% 50%)",
    duration: 1,
    stagger: 0.25,
    ease: "power2.inOut",
  });

  tl.set(".preloader-revealer", { display: "none" });

  items.forEach((item, i) => {
    const target = itemTargets[i];
    const image = item.querySelector("img");

    tl.to(
      item,
      {
        x: target.x,
        y: target.y,
        scale: 1,
        rotation: target.rotation,
        duration: 1,
        ease: "power3.out",
        onStart: () => {
          floatingTweens[i] = gsap.to(image, {
            y: gsap.utils.random(-15, -25),
            duration: gsap.utils.random(1.5, 2.5),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: gsap.utils.random(0, 0.5),
          });
        },
      },
      i === 0 ? "-=0.55" : "<0.075",
    );
  });

  tl.to(
    ".preloader-logo",
    { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
    "<",
  );

  tl.set(".preloader-bg", { display: "none" });

  tl.to({}, { duration: 1 });

  tl.add(() => floatingTweens.forEach((tween) => tween.kill()));

  items.forEach((item, i) => {
    const exit = itemExits[i];

    tl.to(
      item,
      {
        x: exit.x,
        y: exit.y,
        scale: 2.5,
        rotation: exit.rotation,
        duration: 0.75,
        ease: "power2.in",
      },
      i === 0 ? ">" : "<0.075",
    );
  });

  tl.to(
    ".preloader-logo",
    { y: "-120vh", scale: 2.5, duration: 0.75, ease: "power2.in" },
    "<",
  );

  tl.to(
    ".nav-logo img",
    { scale: 1, duration: 0.75, ease: "power3.out" },
    "-=0.4",
  );
  tl.to(
    navLinks.words,
    { yPercent: 0, duration: 0.75, stagger: 0.05, ease: "power3.out" },
    "<0.1",
  );

  tl.to(
    heading.chars,
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.5,
      stagger: 0.015,
      ease: "elastic.out(0.75, 0.25)",
    },
    "<0.15",
  );

  tl.to(
    footerText.lines,
    { yPercent: 0, duration: 0.75, stagger: 0.1, ease: "power3.out" },
    "<0.2",
  );

  tl.to(".hero-img-bg", { scale: 1, duration: 1, ease: "power3.out" }, "<0.1");
  tl.to(
    ".hero-img img",
    { y: "-50%", duration: 1, ease: "power3.out" },
    "<0.3",
  );

  tl.set(".preloader", { display: "none" });

  /* ---------- scroll reveals ---------- */

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!reduceMotion) {
    const revealTargets = [
      ".section-header",
      ".pairing-card",
      ".heat-bottle",
      ".heat-copy",
      ".story-body p",
      ".order-card",
      ".faq-list details",
    ];

    revealTargets.forEach((selector) => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    });

    gsap.to(".heat-bottle img", {
      rotation: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".heat",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }
});
