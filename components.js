/* =============================================================
   SolarSnap Website — Shared Header, Footer & Notify Modal
   ============================================================= */

(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: 'how-it-works.html', label: 'How it works' },
    { href: 'contact.html',      label: 'Support' },
  ];

  function navLink(link) {
    const active = currentPath === link.href ? ' aria-current="page"' : '';
    return `<a href="${link.href}"${active}>${link.label}</a>`;
  }

  const header = `
<header class="site-header">
  <div class="container">
    <a href="index.html" class="site-logo">Solar<span>Snap</span></a>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
      ${navLinks.map(navLink).join('\n      ')}
      <a href="commercial.html" class="nav-commercial${currentPath === 'commercial.html' ? ' aria-current="page"' : ''}">Commercial</a>
      <a href="#notify" class="btn-download js-notify-trigger">Download App</a>
    </nav>
    <button class="nav-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="3" y1="7" x2="21" y2="7"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="17" x2="21" y2="17"/>
      </svg>
    </button>
  </div>
</header>`;

  const footer = `
<footer class="site-footer">
  <div class="container">
    <p class="footer-copy">&copy; ${new Date().getFullYear()} SolarSnap. All rights reserved.</p>
    <div class="footer-links">
      <a href="privacy.html">Privacy Policy</a>
      <a href="contact.html">Contact</a>
      <a href="mailto:info@solarsnap.co.uk">info@solarsnap.co.uk</a>
    </div>
  </div>
</footer>`;

  const modal = `
<div id="notify-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal-box">
    <button class="modal-close js-modal-close" aria-label="Close">&times;</button>
    <div class="modal-icon">☀️</div>
    <h2 class="modal-title" id="modal-title">Be the first to know</h2>
    <p class="modal-body">SolarSnap is launching on iOS and Android soon. Drop your email below and we'll notify you the moment it's live.</p>
    <form id="notify-form" novalidate>
      <div class="modal-input-row">
        <input type="email" id="notify-email" placeholder="your@email.com" required autocomplete="email">
        <button type="submit" class="btn-primary" id="notify-submit">Notify me</button>
      </div>
    </form>
    <div id="notify-success" class="form-success" style="display:none;">
      You're on the list! We'll be in touch as soon as SolarSnap is available to download.
    </div>
    <div id="notify-error" class="form-error" style="display:none;">
      Something went wrong. Please try again or email <a href="mailto:info@solarsnap.co.uk">info@solarsnap.co.uk</a>.
    </div>
    <p class="modal-privacy">No spam, ever. <a href="privacy.html">Privacy policy</a>.</p>
  </div>
</div>`;

  // Inject header
  const headerTarget = document.getElementById('site-header');
  if (headerTarget) headerTarget.outerHTML = header;

  // Inject footer
  const footerTarget = document.getElementById('site-footer');
  if (footerTarget) footerTarget.outerHTML = footer;

  // Inject modal
  document.body.insertAdjacentHTML('beforeend', modal);

  // ---- Modal logic ----
  function openModal() {
    const m = document.getElementById('notify-modal');
    m.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('notify-email')?.focus(), 50);
  }

  function closeModal() {
    const m = document.getElementById('notify-modal');
    m.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    // Mobile nav toggle
    const toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      const nav = document.getElementById('site-nav');
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
      return;
    }

    // Open modal — any store button or download trigger
    if (e.target.closest('.js-notify-trigger, .store-btn')) {
      e.preventDefault();
      openModal();
      return;
    }

    // Close modal — close button or backdrop click
    if (e.target.closest('.js-modal-close') || e.target.id === 'notify-modal') {
      closeModal();
      return;
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Form submission
  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'notify-form') return;
    e.preventDefault();

    const email     = document.getElementById('notify-email').value.trim();
    const submitBtn = document.getElementById('notify-submit');
    const successEl = document.getElementById('notify-success');
    const errorEl   = document.getElementById('notify-error');

    successEl.style.display = 'none';
    errorEl.style.display   = 'none';
    submitBtn.disabled      = true;
    submitBtn.textContent   = 'Sending…';

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      successEl.style.display = 'block';
      document.getElementById('notify-form').reset();
    } catch {
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Notify me';
    }
  });
})();
