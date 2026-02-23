(() => {
  // Mark JS available (lets CSS keep content visible if JS fails)
  document.documentElement.classList.add('js');

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Mobile nav
  const toggle = qs('.nav-toggle');
  const nav = qs('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.style.display = open ? 'none' : 'flex';
      nav.style.flexDirection = 'column';
      nav.style.alignItems = 'flex-start';
      nav.style.gap = '12px';
      nav.style.padding = '0 0 16px';
    });
  }

  // Cursor glow + parallax
  const glow = qs('.cursor-glow');
  let mx = window.innerWidth / 2,
    my = window.innerHeight / 2;
  let gx = mx,
    gy = my;

  const parallaxEls = qsa('[data-parallax]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    if (glow) glow.style.opacity = '1';

    // Tilt cards
    const target = e.target.closest('.tilt');
    if (target && !prefersReduced) {
      const r = target.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-2px)`;
    }
  }

  function onLeave(e) {
    const target = e.target.closest('.tilt');
    if (target) target.style.transform = '';
  }

  if (!prefersReduced) {
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave, { passive: true });
  }

  // Smooth follow for glow & parallax
  function raf() {
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    if (glow) glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;

    if (!prefersReduced) {
      const cx = gx / window.innerWidth - 0.5;
      const cy = gy / window.innerHeight - 0.5;
      for (const el of parallaxEls) {
        const layers = qsa('.layer', el);
        layers.forEach((layer, i) => {
          const depth = (i + 1) * 10;
          layer.style.transform = `translate3d(${cx * depth}px, ${cy * depth}px, 0) scale(1.06)`;
        });
      }
    }

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Reveal on scroll
  const reveals = qsa('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) ent.target.classList.add('in');
        }
      },
      { threshold: 0.15 }
    );
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in'));
  }

  // Scarcity slots (subtle, not spammy)
  const slotsEl = qs('#slots');
  if (slotsEl) {
    const base = 3;
    const day = new Date().getUTCDate();
    const variation = day % 3; // 0-2
    slotsEl.textContent = String(Math.max(1, base - variation));
  }

  // Contact form
  const form = qs('#leadForm');
  const toast = qs('#toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());

      const waNumber = '447704963828';
      const toEmail = 'info@phantomads.online';

      const subjectPlain = `Phantom Ads enquiry: ${payload.niche || 'Regulated brand'}`;
      const messagePlain =
        `Phantom Ads enquiry\n\n` +
        `Name: ${payload.name || ''}\n` +
        `Email: ${payload.email || ''}\n` +
        `Brand URL: ${payload.url || ''}\n` +
        `Market: ${payload.market || ''}\n` +
        `Niche: ${payload.niche || ''}\n` +
        `Budget: ${payload.budget || ''}\n` +
        `Service: ${payload.service || ''}\n\n` +
        `Message:\n${payload.message || ''}\n`;

      const contactMethod = String(payload.contact_method || 'WhatsApp').toLowerCase();

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messagePlain)}`;
      const mailto = `mailto:${toEmail}?subject=${encodeURIComponent(subjectPlain)}&body=${encodeURIComponent(messagePlain)}`;

      if (contactMethod.includes('whatsapp')) {
        showToast('Opening WhatsApp…');
        window.open(waUrl, '_blank', 'noopener');
      } else {
        showToast('Opening your email app…');
        window.location.href = mailto;
      }
    });
  }
})();
