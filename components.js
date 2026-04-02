/* =============================================================
   SolarSnap Website — Shared Header & Footer
   ============================================================= */

(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: 'how-it-works.html', label: 'How it works' },
    { href: 'commercial.html',   label: 'Commercial' },
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
      <a href="#" class="btn-download">Download App</a>
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

  // Inject header
  const headerTarget = document.getElementById('site-header');
  if (headerTarget) headerTarget.outerHTML = header;

  // Inject footer
  const footerTarget = document.getElementById('site-footer');
  if (footerTarget) footerTarget.outerHTML = footer;

  // Mobile nav toggle
  document.addEventListener('click', function (e) {
    const toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      const nav = document.getElementById('site-nav');
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    }
  });
})();
