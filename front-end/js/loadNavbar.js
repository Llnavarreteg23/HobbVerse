document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
});

async function loadNavbar() {
    try {
        const response = await fetch('/front-end/html/nav.html');
        const data = await response.text();
        document.querySelector('nav').innerHTML = data;
        
        // Setup listeners después de cargar el navbar
        setupNavbarListeners();
        
        // Actualizar UI según estado de login
        updateNavbarState();
        
        // Marca la página activa
        markActivePage();
        
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

function updateNavbarState() {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
    const authButtons = document.querySelector('.auth-buttons');
    const mobileAuthButtons = document.querySelector('.mobile-menu .auth-section');
    const userProfile = document.querySelector('.user-profile');
    const profileButton = document.querySelector('.profile-button');
    
    console.log('Updating navbar state, user:', currentUser);
    
    if (currentUser && currentUser.isLoggedIn) {
        // Ocultar botones de auth en desktop
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Ocultar botones de auth en móvil
        if (mobileAuthButtons) {
            mobileAuthButtons.style.display = 'none';
        }
        
        // Mostrar perfil de usuario en desktop
        if (userProfile) {
            userProfile.style.display = 'block';
            const userName = userProfile.querySelector('.user-name');
            if (userName) {
                userName.textContent = currentUser.nombre;
            }
        }
        
        // Mostrar botón de perfil en móvil
        if (profileButton) {
            profileButton.classList.remove('d-none');
            const mobileUserName = profileButton.querySelector('.user-name');
            if (mobileUserName) {
                mobileUserName.textContent = currentUser.nombre;
            }
        }
        
    } else {
        // Mostrar botones de auth en desktop
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        
        // Mostrar botones de auth en móvil
        if (mobileAuthButtons) {
            mobileAuthButtons.style.display = 'block';
        }
        
        // Ocultar elementos de usuario
        if (userProfile) {
            userProfile.style.display = 'none';
        }
        
        if (profileButton) {
            profileButton.classList.add('d-none');
        }
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
    // Función para cerrar sesión
    function logout() {
        localStorage.removeItem('current_user');
        
        // Mostrar alerta de logout
        mostrarAlertaPersonalizada('Sesión cerrada exitosamente', 'success', () => {
            // Emitir evento de logout
            const logoutEvent = new Event('userLoggedOut');
            document.dispatchEvent(logoutEvent);
            
            // Actualizar navbar
            updateNavbarState();
            
            // Redireccionar a inicio
            window.location.href = '/index.html';
        });
    }
    
    // Event listeners para botones de logout (usando delegación de eventos)
    document.addEventListener('click', function(e) {
        if (e.target.matches('#logoutBtn, #logoutBtnMobile')) {
            e.preventDefault();
            logout();
        }
    });
    
    // Escuchar eventos de login/logout
    document.addEventListener('userLoggedIn', function() {
        console.log('Usuario logueado, actualizando navbar');
        updateNavbarState();
    });
    
    document.addEventListener('userLoggedOut', function() {
        console.log('Usuario deslogueado, actualizando navbar');
        updateNavbarState();
    });
    
    // Verificar estado periódicamente (para sincronizar entre pestañas)
    setInterval(() => {
        updateNavbarState();
    }, 5000);
}

// Función para mostrar alertas personalizadas
function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    // Verificar si ya existe una alerta para evitar duplicados
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        document.body.removeChild(existingAlert);
    }
    
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20%';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translate(-50%, -50%)';
    alertContainer.style.padding = '20px';
    alertContainer.style.background = tipo === 'success' ? '#4CAF50' : '#f44336';
    alertContainer.style.color = 'white';
    alertContainer.style.borderRadius = '5px';
    alertContainer.style.textAlign = 'center';
    alertContainer.style.zIndex = '1000';
    alertContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    alertContainer.style.minWidth = '250px';
    
    alertContainer.innerHTML = `<p style="margin: 0; font-size: 18px;">${mensaje}</p>`;
    
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        if (document.body.contains(alertContainer)) {
            document.body.removeChild(alertContainer);
        }
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 2000);
}

// Exponer funciones globalmente si es necesario
window.updateNavbarState = updateNavbarState;
window.mostrarAlertaPersonalizada = mostrarAlertaPersonalizada;