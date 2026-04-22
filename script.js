/**
 * ZELENÝ KOŠÍK – script.js
 *
 * Obsah:
 * 1. Hamburger menu (mobilní navigace)
 * 2. Sticky header (stín a efekt při scrollu)
 * 3. Scroll animace (Intersection Observer pro [data-animate])
 * 4. Zvýrazňování aktivního odkazu v navigaci
 * 5. Newsletter formulář – validace a simulace odeslání
 * 6. Zavření mobilního menu po kliknutí na odkaz
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

  animatableElements.forEach(el => observer.observe(el));
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
   5. NEWSLETTER FORMULÁŘ – VALIDACE A SIMULACE ODESLÁNÍ
   ============================================================ */

const newsletterForm    = document.getElementById('newsletter-form');
const newsletterEmail   = document.getElementById('newsletter-email');
const newsletterMessage = document.getElementById('newsletter-message');

/**
 * Validuje formát e-mailové adresy.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  // RFC 5322 zjednodušená regex validace
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Zobrazí zprávu pod formulářem.
 * @param {string} text    – text zprávy
 * @param {'success'|'error'} type – typ zprávy
 */
function showNewsletterMessage(text, type) {
  newsletterMessage.textContent = text;
  newsletterMessage.className   = `newsletter__message is-${type}`;
}

/**
 * Simuluje asynchronní odeslání formuláře (bez backendu).
 * Zobrazí loading stav, poté potvrzovací zprávu.
 * @param {string} email
 * @returns {Promise<void>}
 */
function simulateSubmit(email) {
  return new Promise((resolve) => {
    // Simulace latence serveru (600–1200 ms)
    setTimeout(resolve, 600 + Math.random() * 600);
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email     = newsletterEmail.value;
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');

    // Vyčistit předchozí zprávy a chybové styly
    showNewsletterMessage('', '');
    newsletterEmail.classList.remove('is-error');

    // --- Validace ---
    if (!email.trim()) {
      showNewsletterMessage('Zadejte prosím svůj e-mail.', 'error');
      newsletterEmail.classList.add('is-error');
      newsletterEmail.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showNewsletterMessage('Zkontrolujte prosím formát e-mailové adresy.', 'error');
      newsletterEmail.classList.add('is-error');
      newsletterEmail.focus();
      return;
    }

    // --- Odeslání ---
    submitBtn.disabled      = true;
    submitBtn.textContent   = 'Odesílám…';
    const originalBtnText   = 'Přihlásit se';

    try {
      await simulateSubmit(email);

      // Úspěch
      showNewsletterMessage(
        `✓ Super! Na adresu ${email} vám budou chodit novinky ze Zeleného košíku.`,
        'success'
      );
      newsletterForm.reset();

    } catch {
      // Chyba (v simulaci nenastane, ale připraveno pro real backend)
      showNewsletterMessage(
        'Něco se nepovedlo. Zkuste to prosím za chvíli.',
        'error'
      );
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Vymazat chybový stav při psaní
  newsletterEmail.addEventListener('input', () => {
    newsletterEmail.classList.remove('is-error');
    if (newsletterMessage.classList.contains('is-error')) {
      showNewsletterMessage('', '');
    }
  });
}

/* ============================================================
   6. MOBILNÍ MENU – ZAVŘÍT PO KLIKNUTÍ NA ODKAZ
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
   INICIALIZACE
   ============================================================ */

// Spustit po načtení DOMu
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initActiveNavHighlight();
});
