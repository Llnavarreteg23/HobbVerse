document.addEventListener('DOMContentLoaded', function() {
    console.log('Login script loaded');
    
    // Setup password toggle 
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        console.log('Toggle password elements found');
        
        togglePassword.addEventListener('click', function() {
            // Toggle password visibility
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon 
            const icon = this.querySelector('i');
            if (icon) {
                // Asegurarse de que los iconos sean correctos y alternamos entre ellos
                if (type === 'text') {
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                } else {
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                }
            } else {
                console.log('Icon element not found inside toggle button');
            }
        });
    } else {
        console.log('Toggle password elements not found:', {
            togglePassword: togglePassword ? 'Found' : 'Not found',
            passwordInput: passwordInput ? 'Found' : 'Not found'
        });
    }

    // Manejar envío del formulario de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Verificar credenciales de admin
            if (email === 'AdminHobb@hobbverse.com' && password === 'HobbAdmin1') {
                const adminUser = {
                    email: email,
                    nombre: 'Administrador',
                    isLoggedIn: true,
                    isAdmin: true
                };
                localStorage.setItem('current_user', JSON.stringify(adminUser));
                
                // Usar la función global de alerta
                window.mostrarAlertaPersonalizada('¡Bienvenido Administrador!', 'success', () => {
                    window.location.href = '/front-end/html/admin.html';
                });
                return;
            }
            
            // Verificar usuarios normales
            const usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
            const usuario = usuarios.find(user => 
                user.email === email && user.password === password
            );
            
            if (usuario) {
                const sessionData = {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    isLoggedIn: true
                };
                
                localStorage.setItem('current_user', JSON.stringify(sessionData));
                
                // Emitir evento de login exitoso
                const loginEvent = new Event('userLoggedIn');
                document.dispatchEvent(loginEvent);
                
                // Usar la función global de alerta
                window.mostrarAlertaPersonalizada('¡Inicio de sesión exitoso!', 'success', () => {
                    window.location.href = '/index.html';
                });
            } else {
                window.mostrarAlertaPersonalizada('Credenciales incorrectas', 'error');
            }
        });
    } else {
        console.error('Login form not found');
    }
});