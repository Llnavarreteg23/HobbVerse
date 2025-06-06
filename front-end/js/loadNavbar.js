document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
});

async function loadNavbar() {
    try {
        const response = await fetch('/front-end/html/nav.html');
        const data = await response.text();
        document.querySelector('nav').innerHTML = data;
        
        // Esperar un tick para asegurar que el DOM esté actualizado
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Setup listeners después de cargar el navbar
        setupNavbarListeners();
        
        // Actualizar UI según estado de login
        updateNavbarState();
        
        // Marcar página activa
        markActivePage();
        
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

function updateNavbarState() {
    let currentUser = null;
    
    try {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('current_user');
    }
    
    // Seleccionar todos los elementos relevantes
    const authButtons = document.querySelectorAll('.auth-buttons');
    const mobileAuthSection = document.querySelector('.auth-section');
    const userProfile = document.querySelector('.user-profile');
    const profileButton = document.querySelector('.profile-button');
    
    if (currentUser?.isLoggedIn) {
        // Ocultar botones de autenticación
        authButtons.forEach(btn => btn.style.display = 'none');
        if (mobileAuthSection) mobileAuthSection.style.display = 'none';
        
        // Mostrar perfil de usuario
        if (userProfile) {
            userProfile.style.display = 'flex';
            const userNames = document.querySelectorAll('.user-name');
            userNames.forEach(name => {
                name.textContent = currentUser.nombre;
            });
        }
        
        // Mostrar botón de perfil en móvil
        if (profileButton) profileButton.classList.remove('d-none');
        
    } else {
        // Mostrar botones de autenticación
        authButtons.forEach(btn => btn.style.display = 'flex');
        if (mobileAuthSection) mobileAuthSection.style.display = 'block';
        
        // Ocultar elementos de usuario
        if (userProfile) userProfile.style.display = 'none';
        if (profileButton) profileButton.classList.add('d-none');
    }
}

function markActivePage() {
    const currentPage = window.location.pathname;
    const menuItems = document.querySelectorAll('.nav-link, .dropdown-item, .mobile-menu-item');
    
    menuItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref === currentPage || 
            (currentPage === '/' && itemHref === '/index.html') ||
            (currentPage === '/index.html' && itemHref === '/')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function setupNavbarListeners() {
    // Remover listeners existentes para evitar duplicados
    const existingLogoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnMobile');
    existingLogoutBtns.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Usar delegación de eventos más específica
    document.addEventListener('click', function(e) {
        // Verificar si el elemento clickeado es un botón de logout
        if (e.target.matches('#logoutBtn, #logoutBtnMobile') || 
            e.target.closest('#logoutBtn, #logoutBtnMobile')) {
            e.preventDefault();
            e.stopPropagation();
            handleLogout(e);
        }
    }, true);
    
    
    setTimeout(() => {
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout, true);
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', handleLogout, true);
        }
    }, 100);
}

function handleLogout(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Logout iniciado...'); // Debug
    
    try {
        // Limpiar la sesión
        localStorage.removeItem('current_user');
        
        // Disparar evento de cierre de sesión
        const logoutEvent = new Event('userLoggedOut');
        document.dispatchEvent(logoutEvent);
        
        // Actualizar UI inmediatamente
        updateNavbarState();
        
        // Mostrar mensaje y redireccionar
        if (typeof window.mostrarAlertaPersonalizada === 'function') {
            window.mostrarAlertaPersonalizada('Has cerrado sesión correctamente', 'success', () => {
                window.location.href = '/index.html';
            });
        } else {
            // Fallback si la función de alerta no está disponible
            alert('Has cerrado sesión correctamente');
            window.location.href = '/index.html';
        }
        
    } catch (error) {
        console.error('Error durante el logout:', error);
        if (typeof window.mostrarAlertaPersonalizada === 'function') {
            window.mostrarAlertaPersonalizada('Error al cerrar sesión', 'error');
        } else {
            alert('Error al cerrar sesión');
        }
    }
}

// Función para mostrar alertas personalizadas
function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    // Verificar si ya existe un contenedor de alerta para evitar duplicados
    const existingAlert = document.querySelector('.alert-container');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert-container ${tipo}`;
    
    alertContainer.innerHTML = `
        <div class="custom-alert">
            <div class="alert-content">
                <i class="bi ${tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        </div>
    `;
    
    // Agregar estilos básicos si no existen
    if (!document.querySelector('#alert-styles')) {
        const styles = document.createElement('style');
        styles.id = 'alert-styles';
        styles.textContent = `
            .alert-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            }
            .custom-alert {
                padding: 15px;
                border-radius: 5px;
                color: white;
                animation: slideIn 0.3s ease-out;
            }
            .alert-container.success .custom-alert {
                background-color: #28a745;
            }
            .alert-container.error .custom-alert {
                background-color: #dc3545;
            }
            .alert-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.remove();
        }
        if (callback) callback();
    }, 2000);
}

// Función para reinicializar el navbar (útil si se necesita recargar)
function reinitializeNavbar() {
    setupNavbarListeners();
    updateNavbarState();
    markActivePage();
}

// Escuchar eventos de cambio de sesión
document.addEventListener('userLoggedIn', function() {
    updateNavbarState();
});

document.addEventListener('userLoggedOut', function() {
    updateNavbarState();
});


window.handleLogout = handleLogout;
window.updateNavbarState = updateNavbarState;
window.mostrarAlertaPersonalizada = mostrarAlertaPersonalizada;
window.reinitializeNavbar = reinitializeNavbar;