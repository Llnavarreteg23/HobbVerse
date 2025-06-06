const ADMIN_CREDENTIALS = {
    email: 'AdminHobb@hobbverse.com',
    password: 'HobbAdmin1'
};

function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (!currentUser || !currentUser.isLoggedIn || currentUser.email !== ADMIN_CREDENTIALS.email) {
        // Redirigir a página de error
        showAdminError();
        return false;
    }
    return true;
}

function showAdminError() {
    // Reemplazar el contenido actual con mensaje de error
    document.body.innerHTML = `
        <div class="admin-error-container">
            <div class="error-content">
                <div class="error-icon">
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                <h1>Acceso Restringido</h1>
                <p>Lo sentimos, esta área está reservada para administradores de HobbVerse.</p>
                <div class="error-details">
                    <p>Si eres administrador, por favor inicia sesión con tus credenciales.</p>
                </div>
                <div class="error-actions">
                    <a href="/front-end/html/login.html" class="btn btn-primary">
                        <i class="bi bi-box-arrow-in-right"></i>
                        Iniciar Sesión
                    </a>
                    <a href="/index.html" class="btn btn-outline-secondary">
                        <i class="bi bi-house"></i>
                        Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Ejecutar verificación cuando se carga la página
document.addEventListener('DOMContentLoaded', checkAdminAuth);