/**
 * ZELENÝ KOŠÍK – script.js
 *
 * Obsah:
 * 1. Hamburger menu (mobilní navigace)
 * 2. Sticky header (stín a efekt při scrollu)
 * 3. Scroll animace (Intersection Observer pro [data-animate])
 * 4. Zvýrazňování aktivního odkazu v navigaci
 * 5. Zavření mobilního menu po kliknutí na odkaz
 * 6. Načtení externích embedů až po kliknutí
 */

'use strict';

/* ============================================================
   1. HAMBURGER MENU (MOBILNÍ NAVIGACE)
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

/**
 * Přepíná otevření/zavření mobilní navigace.
 * Nastavuje třídu a ARIA atribut pro přístupnost.
 */
function toggleMenu() {
  const isOpen = nav.classList.toggle('is-open');
  hamburger.classList.toggle('is-active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));

  // Zamknout scrollování stránky při otevřeném menu
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (hamburger && nav) {
  hamburger.addEventListener('click', toggleMenu);
}

/* ============================================================
   2. STICKY HEADER – EFEKT PŘI SCROLLU
   ============================================================ */
const header = document.getElementById('header');

/**
 * Přidá nebo odebere třídu "is-scrolled" na headeru podle pozice scrollu.
 * Třída aktivuje stín a plný background (viz CSS).
 */
function handleHeaderScroll() {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('is-scrolled', scrolled);
}

if (header) {
  // Zavolat okamžitě pro případ, že stránka začíná scrollovaná
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
}

/* ============================================================
   3. SCROLL ANIMACE – INTERSECTION OBSERVER
   ============================================================ */

/**
 * Sleduje prvky s atributem [data-animate].
 * Jakmile vstoupí do viewportu, přidá třídu "is-visible",
 * která spustí CSS přechod (fade + slide-up).
 */
function initScrollAnimations() {
  const animatableElements = document.querySelectorAll('[data-animate]');

  if (!animatableElements.length || !('IntersectionObserver' in window)) {
    // Fallback pro staré prohlížeče – zobrazit vše okamžitě
    animatableElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Po animaci přestat sledovat (šetří výkon)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // Spustí se, jakmile je 12 % prvku viditelných
      rootMargin: '0px 0px -40px 0px',  // Trochu dřív, než prvek dosáhne spodního okraje
    }
  );

  animatableElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const isInitiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInitiallyVisible) {
      el.classList.add('is-visible');
      return;
    }

    observer.observe(el);
  });
}

/* ============================================================
   4. AKTIVNÍ ODKAZ V NAVIGACI
   ============================================================ */

/**
 * Zvýrazňuje navigační odkaz odpovídající aktuálně zobrazené sekci.
 * Používá IntersectionObserver pro sledování sekcí s ID.
 */
function initActiveNavHighlight() {
  const navLinks  = document.querySelectorAll('.nav__link[href^="#"]');
  const sections  = document.querySelectorAll('main section[id]');

  if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) {
    return;
  }

  // Mapa: sectionId -> navLink
  const linkMap = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href').substring(1);
    linkMap[id] = link;
  });

  let currentSection = '';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentSection = entry.target.id;
        }
      });

      // Aktualizovat aktivní třídu
      navLinks.forEach(link => link.classList.remove('is-active'));
      if (linkMap[currentSection]) {
        linkMap[currentSection].classList.add('is-active');
      }
    },
    {
      rootMargin: '-40% 0px -55% 0px',  // Sekce je "aktivní", když je přibližně uprostřed obrazovky
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}

/* ============================================================
   5. MOBILNÍ MENU – ZAVŘÍT PO KLIKNUTÍ NA ODKAZ
   ============================================================ */

/**
 * Zavře mobilní menu po kliknutí na jakýkoliv navigační odkaz.
 * Zároveň obnoví scrollování stránky.
 */
if (nav) {
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });
}

/* ============================================================
   6. EXTERNÍ EMBEDY – NAČÍST AŽ PO KLIKNUTÍ
   ============================================================ */
function initExternalEmbeds() {
  const embedButtons = document.querySelectorAll('[data-load-embed]');
  const allowedEmbedHosts = new Set(['www.facebook.com', 'maps.google.com']);

  embedButtons.forEach(button => {
    button.addEventListener('click', () => {
      const frameWrap = button.closest('[data-embed-frame]');
      const src = button.dataset.src;

      if (!frameWrap || !src) {
        return;
      }

      let embedUrl;
      try {
        embedUrl = new URL(src, window.location.href);
      } catch {
        return;
      }

      if (embedUrl.protocol !== 'https:' || !allowedEmbedHosts.has(embedUrl.hostname)) {
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl.href;
      iframe.title = button.dataset.title || 'Externí obsah';
      iframe.width = button.dataset.width || '100%';
      iframe.height = button.dataset.height || '380';
      iframe.loading = 'lazy';
      iframe.style.border = '0';
      iframe.referrerPolicy = button.dataset.referrerpolicy || 'strict-origin-when-cross-origin';

      if (button.dataset.allow) {
        iframe.allow = button.dataset.allow;
      }

      if (button.dataset.allowfullscreen === 'true') {
        iframe.allowFullscreen = true;
      }

      frameWrap.replaceChildren(iframe);
    });
  });
}

/* ============================================================
   INICIALIZACE
   ============================================================ */

// Spustit po načtení DOMu
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initActiveNavHighlight();
  initExternalEmbeds();
});
