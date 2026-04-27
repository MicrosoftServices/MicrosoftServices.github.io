fetch('banner_footer.html')
  .then(r => {
    if (!r.ok) throw new Error('Error al cargar: ' + r.status);
    return r.text();
  })
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Inyectar estilos del banner_footer.html
    doc.querySelectorAll('style').forEach(style => {
      document.head.appendChild(style.cloneNode(true));
    });

    // 2. Estilos del header flotante — sin causar overflow
    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
      html, body {
        overflow-x: hidden !important;
        max-width: 100% !important;
      }

      /* Placeholder fijo que flota encima del hero */
      #header-placeholder {
        position: fixed;
        top: 20px;
        left: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
        z-index: 1000;
        pointer-events: none;
      }

      /* El header real dentro del placeholder */
      #header-placeholder .pt-header {
        position: static !important;
        top: auto !important;
        margin: 0 auto !important;
        max-width: 1400px;
        width: 100%;
        pointer-events: all;
      }

      /* Hero ocupa toda la pantalla al entrar */
      .pt-hero {
        height: 100vh !important;
        min-height: 100vh !important;
        margin-top: 0 !important;
      }

      .pt-page {
        /* padding-top manejado dinamicamente por adjustPagePadding() */
      }
    `;
    document.head.appendChild(extraStyle);

    // 3. Insertar elementos
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    ['pt-mobile-checkbox', 'pt-mobile-overlay', 'pt-mobile-menu', 'pt-header'].forEach(cls => {
      const el = doc.querySelector('.' + cls);
      if (el && headerPlaceholder) headerPlaceholder.appendChild(document.adoptNode(el));
    });

    const footer = doc.querySelector('.pt-footer');
    if (footer && footerPlaceholder) footerPlaceholder.appendChild(document.adoptNode(footer));

    // 4. Efecto scroll: glassmorphism
    const mainHeader = document.getElementById('mainHeader');
    function checkScroll() {
      if (!mainHeader) return;
      mainHeader.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    // Ajustar padding-top dinamicamente segun altura real del header
    function adjustPagePadding() {
      const h = document.getElementById("mainHeader");
      const page = document.querySelector(".pt-page");
      if (h && page) {
        page.style.paddingTop = (h.offsetHeight + 28) + "px";
      }
    }
    adjustPagePadding();
    window.addEventListener("resize", adjustPagePadding);
    checkScroll();

    // 5. Menú móvil: cerrar al hacer clic en enlace
    const cb = document.getElementById('pt-mobile-menu-toggle');
    document.querySelectorAll('.pt-mobile-menu a').forEach(link => {
      link.addEventListener('click', () => { if (cb) cb.checked = false; });
    });
  })
  .catch(err => console.error('Error:', err));
