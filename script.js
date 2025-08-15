/* ===== AOS / Typed / GSAP bootstrap ===== */
AOS.init({ duration: 900, once: true });

new Typed('#typed', {
  strings: [
    "Muhammad Furqan Ul Arsh",
    "Mechanical Engineer",
    "Robotics | Renewable Energy",
    "Experimental Research"
  ],
  typeSpeed: 45,
  backSpeed: 22,
  backDelay: 1200,
  loop: true,
  smartBackspace: true
});

/* Subtle entrance animations */
gsap.from(".logo", { y: -30, opacity: 0, duration: 0.8, ease: "power2.out" });
gsap.from(".nav-links li", { y: -18, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" });

/* ===== Scroll spy for active nav ===== */
const sections = Array.from(document.querySelectorAll("section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const link = navLinks.find(a => a.getAttribute("href") === `#${id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
);
sections.forEach(sec => spy.observe(sec));

/* ===== Smooth anchor focus (a11y) ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if(!el) return;
    el.setAttribute("tabindex","-1");
    el.focus({preventScroll:true});
  });
});

/* ===== Contact form (front-end only) ===== */
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks! Your message has been noted. 🚀");
    form.reset();
  });
}