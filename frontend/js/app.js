// ========================================
// PARKFLOW - JavaScript Compartido
// ========================================

const API_URL = 'http://localhost:3000/api';
let sidebarCollapsed = false;

// Toggle sidebar (solo icono al colapsar)
function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
    }
}

// Logout
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('parking_token');
        localStorage.removeItem('parking_user');
        window.location.href = 'index.html';
    }
}

// Marcar página activa con sombreado
function marcarPaginaActiva() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
        const page = item.getAttribute('data-page') || item.getAttribute('href').replace('.html', '');
        
        if (page === currentPage || page === currentPage + '.html') {
            item.classList.add('active');
        }
    });
}

// Inicialización en cada página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const user = JSON.parse(localStorage.getItem('parking_user') || '{}');
    
    if (!user.nombre && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Actualizar info de usuario
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName) userName.textContent = user.nombre || 'Usuario';
    if (userRole) userRole.textContent = user.rol || 'Rol';

    // Mostrar opciones de admin
    if (user.rol === 'Administrador') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    }

    // Restaurar estado del sidebar SIN ANIMACIÓN para evitar rebote
    const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    const sidebar = document.querySelector('.sidebar');
    if (collapsed && sidebar) {
        // Desactivar transiciones temporalmente
        sidebar.style.transition = 'none';
        sidebar.classList.add('collapsed');
        sidebarCollapsed = true;
        // Reactivar transiciones después de aplicar el estado
        setTimeout(() => {
            sidebar.style.transition = '';
        }, 50);
    }

    // Marcar página activa
    marcarPaginaActiva();

    // Fecha actual en topbar
    const fechaActual = document.getElementById('fechaActual');
    if (fechaActual) {
        const fecha = new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        fechaActual.textContent = fecha;
    }
});

// Funciones auxiliares
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearMonto(monto) {
    return `$${Number(monto).toLocaleString('es-CO')}`;
}

function mostrarError(mensaje) {
    alert(mensaje); // Mejorar con toast notifications
}

function mostrarExito(mensaje) {
    alert(mensaje); // Mejorar con toast notifications
}
