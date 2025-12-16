// banner-footer.js
function loadBannerFooter() {
    // Crear contenedores
    const bannerContainer = document.createElement('div');
    bannerContainer.id = 'banner-container';
    document.body.insertBefore(bannerContainer, document.body.firstChild);
    
    const footerContainer = document.createElement('div');
    footerContainer.id = 'footer-container';
    document.body.appendChild(footerContainer);
    
    // Cargar el archivo HTML
    fetch('banner-footer.html')
        .then(response => response.text())
        .then(data => {
            // Insertar banner
            const headerMatch = data.match(/<header[\s\S]*?<\/header>/);
            if (headerMatch) {
                bannerContainer.innerHTML = headerMatch[0];
            }
            
            // Insertar footer
            const footerMatch = data.match(/<footer[\s\S]*?<\/footer>/);
            if (footerMatch) {
                footerContainer.innerHTML = footerMatch[0];
            }
            
            // Inicializar componentes
            initComponents();
        })
        .catch(error => console.error('Error al cargar banner y footer:', error));
}

function initComponents() {
    // (El mismo código de la función initComponents de la Opción 1)
    // Menú móvil, enlace activo, smooth scrolling...
}

document.addEventListener('DOMContentLoaded', loadBannerFooter);