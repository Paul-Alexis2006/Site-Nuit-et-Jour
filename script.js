const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const rubriqueNavLinks = document.querySelectorAll('.rubrique-nav a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMenu = () => {
  header.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

const handleScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  if (prefersReducedMotion) return;

  parallaxItems.forEach((item) => {
    const speed = item.classList.contains("hero-media") ? 0.045 : 0.03;
    const offset = window.scrollY * speed;
    item.style.transform = item.classList.contains("hero-media")
      ? `scale(1.06) translate3d(0, ${offset}px, 0)`
      : `translate3d(0, ${offset}px, 0)`;
  });
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 220)}ms`);
  revealObserver.observe(item);
});

if (rubriqueNavLinks.length > 0) {
  const rubriqueNav = document.querySelector(".rubrique-nav");
  const rubriqueSections = Array.from(
    new Set(
      Array.from(rubriqueNavLinks)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean)
    )
  ).sort((sectionA, sectionB) => {
    if (sectionA === sectionB) return 0;

    const position = sectionA.compareDocumentPosition(sectionB);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  const syncActiveRubriqueLinkIntoView = (activeLink) => {
    if (!rubriqueNav || !activeLink) return;

    const navRect = rubriqueNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const linkAbove = linkRect.top < navRect.top + 24;
    const linkBelow = linkRect.bottom > navRect.bottom - 24;

    if (linkAbove || linkBelow) {
      activeLink.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  const setActiveRubriqueLink = (id) => {
    let activeLink = null;

    rubriqueNavLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    syncActiveRubriqueLinkIntoView(activeLink);
  };

  const updateActiveRubriqueFromHash = () => {
    const hashId = window.location.hash.replace("#", "");
    if (!hashId) return;
    const matchingSection = rubriqueSections.find((section) => section.id === hashId);
    if (matchingSection) {
      activeRubriqueId = hashId;
      setActiveRubriqueLink(hashId);
    }
  };

  let activeRubriqueId = window.location.hash.replace("#", "") || rubriqueSections[0]?.id;

  const updateActiveRubriqueOnScroll = () => {
    if (rubriqueSections.length === 0) return;

    const headerOffset = header?.offsetHeight ?? 0;
    const activationLine = headerOffset + 120;
    let nextActiveSection = rubriqueSections[0];

    rubriqueSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) {
        nextActiveSection = section;
      }
    });

    if (!nextActiveSection || nextActiveSection.id === activeRubriqueId) return;

    activeRubriqueId = nextActiveSection.id;
    setActiveRubriqueLink(activeRubriqueId);
  };

  window.addEventListener("scroll", updateActiveRubriqueOnScroll, { passive: true });
  window.addEventListener("hashchange", updateActiveRubriqueFromHash);
  updateActiveRubriqueFromHash();

  if (!window.location.hash && rubriqueSections[0]) {
    activeRubriqueId = rubriqueSections[0].id;
    setActiveRubriqueLink(activeRubriqueId);
  }

  updateActiveRubriqueOnScroll();
}
