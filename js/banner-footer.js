/* =============================================================
   banner-footer.js  –  HIMANABI
   Carga dinámica del header y footer + inicialización completa
   Compatible PC y móvil  |  Sin errores de consola
   ============================================================= */

(function () {
  'use strict';

  /* ── Rutas posibles del archivo fuente ───────────────────── */
  var SOURCES = [
    '../html/banner-footer.html',
    './banner-footer.html',
    '/html/banner-footer.html'
  ];

  /* ═══════════════════════════════════════════════════════════
     1. CARGA DEL HTML
     ═══════════════════════════════════════════════════════════ */
  async function tryFetch(sources) {
    for (var i = 0; i < sources.length; i++) {
      try {
        var res = await fetch(sources[i]);
        if (res.ok) return res.text();
      } catch (_) { /* siguiente intento */ }
    }
    throw new Error('No se pudo cargar banner-footer.html desde ninguna ruta.');
  }

  async function loadBannerFooter() {
    try {
      var html   = await tryFetch(SOURCES);
      var parser = new DOMParser();
      var doc    = parser.parseFromString(html, 'text/html');

      /* — Header — */
      var headerEl  = doc.querySelector('header');
      var bannerBox = document.getElementById('banner-container');
      if (headerEl && bannerBox) {
        bannerBox.appendChild(headerEl.cloneNode(true));
      }

      /* — Overlay móvil (vive fuera del <header> en el HTML fuente) — */
      var overlayEl = doc.querySelector('.bf-mobile-overlay');
      if (overlayEl) {
        if (bannerBox && bannerBox.parentNode) {
          bannerBox.parentNode.insertBefore(overlayEl.cloneNode(true),
                                            bannerBox.nextSibling);
        } else {
          document.body.insertBefore(overlayEl.cloneNode(true),
                                     document.body.firstChild);
        }
      }

      /* — Footer — */
      var footerEl  = doc.querySelector('footer');
      var footerBox = document.getElementById('footer-container');
      if (footerEl && footerBox) {
        footerBox.appendChild(footerEl.cloneNode(true));
      }

      /* — Arrancar toda la lógica — */
      initComponents();

    } catch (err) {
      console.error('[HIMANABI] Error al cargar banner y footer:', err.message);
      var b = document.getElementById('banner-container');
      var f = document.getElementById('footer-container');
      if (b) b.innerHTML = '';
      if (f) f.innerHTML = '';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     2. INICIALIZACIÓN DE COMPONENTES
     ═══════════════════════════════════════════════════════════ */
  function initComponents() {
    initScrollHeader();
    initMobileMenu();
    initActiveLink();
  }

  /* ── 2a. Sombra del header al hacer scroll ──────────────── */
  function initScrollHeader() {
    var header = document.getElementById('bf-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2b. Menú hamburguesa + overlay móvil ───────────────── */
  function initMobileMenu() {
    var menuToggle = document.getElementById('bf-menu-toggle');
    var overlay    = document.getElementById('bf-overlay');
    var overlayBg  = document.getElementById('bf-overlay-bg');
    var closeBtn   = document.getElementById('bf-overlay-close');
    var navLinks   = document.querySelectorAll('.bf-nav-link');

    if (!menuToggle || !overlay) return;

    var isOpen = false;

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add('open');
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var firstFocusable = overlay.querySelector('a, button');
      if (firstFocusable) {
        setTimeout(function () { firstFocusable.focus(); }, 400);
      }
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();
    }

    var lastToggleTime = 0;
    function handleToggle(e) {
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (now - lastToggleTime < 300) return;
      lastToggleTime = now;
      isOpen ? closeMenu() : openMenu();
    }

    menuToggle.addEventListener('click',      handleToggle);
    menuToggle.addEventListener('touchstart', handleToggle, { passive: false });

    if (closeBtn) {
      var lastCloseTime = 0;
      function handleClose(e) {
        e.preventDefault();
        e.stopPropagation();
        var now = Date.now();
        if (now - lastCloseTime < 300) return;
        lastCloseTime = now;
        closeMenu();
      }
      closeBtn.addEventListener('click',      handleClose);
      closeBtn.addEventListener('touchstart', handleClose, { passive: false });
    }

    function handleBgTap(e) {
      if (e.target === overlayBg || e.target === overlay) {
        e.preventDefault();
        closeMenu();
      }
    }
    overlay.addEventListener('click',      handleBgTap);
    overlay.addEventListener('touchstart', handleBgTap, { passive: false });

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
      link.addEventListener('touchend', function () {
        setTimeout(closeMenu, 50);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });
  }

  /* ── 2c. Marcar enlace activo en la navegación ──────────── */
  function initActiveLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.bf-navbar a, .bf-overlay-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPage = href.split('/').pop();
      if (
        currentPage === linkPage ||
        (currentPage === '' && linkPage === 'index.html') ||
        (linkPage !== 'index.html' && currentPage.includes(linkPage))
      ) {
        link.classList.add('active');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     3. ARRANQUE
     ═══════════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBannerFooter);
  } else {
    loadBannerFooter();
  }

})();
