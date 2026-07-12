/* =========================================================================
   Houston Home Tech Help — shared behavior (business-agnostic)
   Accessibility widget · scroll-to-top · mobile nav · Services dropdown · FAQ
   ========================================================================= */
(function () {
  'use strict';

  var MOBILE_BREAKPOINT = 1040;
  function isMobileNav() { return window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)').matches; }

  /* ---- Accessibility widget (persisted to localStorage) ---- */
  var accBtn = document.getElementById('accBtn');
  var accMenu = document.getElementById('accMenu');
  var FEATURES = { 'high-contrast': 'contrast-check', 'large-text': 'text-check', 'highlight-links': 'links-check' };
  var STORAGE_KEY = 'hhth-a11y';

  function setAccExpanded(open) {
    if (!accBtn || !accMenu) return;
    accBtn.setAttribute('aria-expanded', String(open));
    accMenu.classList.toggle('active', open);
  }
  function saveA11y() {
    try {
      var active = Object.keys(FEATURES).filter(function (c) { return document.body.classList.contains(c); });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    } catch (e) { /* ignore */ }
  }
  function reflectFeature(className, on) {
    var cb = document.getElementById(FEATURES[className]);
    if (cb) cb.checked = on;
    var opt = document.querySelector('.acc-option[data-feature="' + className + '"]');
    if (opt) opt.setAttribute('aria-checked', String(on));
  }
  function toggleFeature(className) {
    var on = document.body.classList.toggle(className);
    reflectFeature(className, on);
    saveA11y();
  }
  function restoreA11y() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { saved = []; }
    saved.forEach(function (className) {
      if (FEATURES[className]) { document.body.classList.add(className); reflectFeature(className, true); }
    });
  }
  restoreA11y();

  if (accBtn && accMenu) {
    accBtn.addEventListener('click', function () { setAccExpanded(!accMenu.classList.contains('active')); });
  }
  document.querySelectorAll('.acc-option[data-feature]').forEach(function (el) {
    el.addEventListener('click', function () { toggleFeature(el.dataset.feature); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFeature(el.dataset.feature); }
    });
  });
  var accReset = document.getElementById('accReset');
  if (accReset) accReset.addEventListener('click', function () {
    Object.keys(FEATURES).forEach(function (className) {
      document.body.classList.remove(className);
      reflectFeature(className, false);
    });
    saveA11y();
  });
  document.addEventListener('click', function (event) {
    if (accMenu && !event.target.closest('.accessibility-widget') && accMenu.classList.contains('active')) setAccExpanded(false);
  });

  /* ---- Scroll-to-top ---- */
  var scrollTopBtn = document.getElementById('scrollTop');
  function onScroll() { if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400); }
  if (scrollTopBtn) {
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();
  }

  /* ---- Mobile hamburger + Services dropdown ---- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var navBackdrop = document.getElementById('navBackdrop');

  function closeMobileNav() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('open'); navLinks.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  function toggleMobileNav() {
    if (!hamburger || !navLinks) return;
    var isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }
  function closeAllDropdowns() {
    document.querySelectorAll('.has-dropdown.open').forEach(function (li) {
      li.classList.remove('open');
      var trig = li.querySelector('.nav-dropdown-trigger'); if (trig) trig.setAttribute('aria-expanded', 'false');
    });
  }
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (isMobileNav()) {
        e.preventDefault();
        var li = trigger.closest('.has-dropdown'); if (!li) return;
        var wasOpen = li.classList.contains('open');
        document.querySelectorAll('.has-dropdown.open').forEach(function (o) {
          if (o !== li) { o.classList.remove('open'); var t = o.querySelector('.nav-dropdown-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }
        });
        li.classList.toggle('open', !wasOpen);
        trigger.setAttribute('aria-expanded', String(!wasOpen));
      }
    });
  });
  document.querySelectorAll('.dropdown-menu a').forEach(function (a) { a.addEventListener('click', closeAllDropdowns); });
  document.addEventListener('click', function (event) {
    if (!isMobileNav() && !event.target.closest('.has-dropdown')) closeAllDropdowns();
  });
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', toggleMobileNav);
    if (navBackdrop) navBackdrop.addEventListener('click', closeMobileNav);
    navLinks.querySelectorAll('a').forEach(function (a) {
      if (a.classList.contains('nav-dropdown-trigger')) return;
      a.addEventListener('click', function () { closeAllDropdowns(); closeMobileNav(); });
    });
  }
  window.addEventListener('resize', closeAllDropdowns);

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      if (!item) return;
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Global Escape ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (accMenu && accMenu.classList.contains('active')) { setAccExpanded(false); if (accBtn) accBtn.focus(); }
    if (document.querySelector('.has-dropdown.open')) closeAllDropdowns();
    if (navLinks && navLinks.classList.contains('open')) closeMobileNav();
  });
})();
