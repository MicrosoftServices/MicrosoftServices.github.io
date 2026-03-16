// Función para cargar el archivo y extraer header y footer usando DOMParser
async function loadBannerFooter() {
  try {
    const response = await fetch('../html/banner-footer.html');
    if (!response.ok) throw new Error('No se pudo cargar el archivo');

    const html = await response.text();

    // Usar DOMParser para interpretar el HTML correctamente
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extraer el header y el footer
    const header = doc.querySelector('header');
    const footer = doc.querySelector('footer');

    if (header) {
      document.getElementById('banner-container').appendChild(header.cloneNode(true));
    }
    if (footer) {
      document.getElementById('footer-container').appendChild(footer.cloneNode(true));
    }

    // Inicializar componentes (menú móvil, slider, etc.)
    initComponents();
  } catch (error) {
    console.error('Error al cargar banner y footer:', error);
    // Opcional: mostrar contenido de respaldo
    document.getElementById('banner-container').innerHTML = '<p>Error al cargar el banner</p>';
    document.getElementById('footer-container').innerHTML = '<p>Error al cargar el footer</p>';
  }
}

// Inicializar componentes después de insertar el HTML
function initComponents() {
  // Menú móvil
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  // Cerrar menú al hacer clic en enlace (móvil)
  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 850 && navbar) {
        navbar.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    });
  });

  // Marcar enlace activo según la página actual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar a').forEach(link => {
    const linkHref = link.getAttribute('href').split('/').pop();
    if (currentPage === linkHref || 
        (currentPage === '' && linkHref === 'index.html') ||
        (currentPage.includes(linkHref) && linkHref !== 'index.html')) {
      link.classList.add('active');
    }
  });

  // Menú circular del footer
  const circleToggle = document.getElementById('bf-circle-toggle');
  const circleMenu   = document.getElementById('bf-circle-menu');
  if (circleToggle && circleMenu) {
    circleToggle.addEventListener('click', () => {
      circleMenu.classList.toggle('active');
    });
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadBannerFooter);