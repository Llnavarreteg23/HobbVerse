

function handleSuccessfulLogin() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    localStorage.setItem('isLoggedIn', 'true');
}

function handleLogout() {
    document.getElementById('auth-buttons').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/index.html';
}

// Función de login
function login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Aquí irían tus validaciones de login
    const loginExitoso = true; // Modificar según tu lógica de validación

    if (loginExitoso) {
        handleSuccessfulLogin();
        // Cerrar el modal de login si estás usando uno
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
    }
}

// Verificar estado de login al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        handleSuccessfulLogin();
    }

    // Event listeners
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('loginForm')?.addEventListener('submit', login);
});