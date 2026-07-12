/* =========================================================================
   Houston Home Tech Help — GA4 event wiring
   Attaches conversion events to phone/email clicks, CTAs, and the contact form.
   Safe no-op if gtag isn't loaded (e.g. placeholder GA4 id before launch).
   ========================================================================= */
(function () {
  'use strict';

  function track(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  // Phone clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('phone_click', { method: 'tel', location: a.dataset.loc || 'page' });
    });
  });

  // Email clicks
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('email_click', { method: 'mailto', location: a.dataset.loc || 'page' });
    });
  });

  // Primary CTA clicks (any element flagged data-cta)
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_click', { cta: el.dataset.cta });
    });
  });

  // Blog CTA clicks
  document.querySelectorAll('[data-blog-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('blog_cta_click', { slug: el.dataset.blogCta || '' });
    });
  });

  // Expose a helper the contact form uses on successful submit
  window.trackFormSubmit = function () {
    track('form_submit', { form: 'contact' });
  };
})();
