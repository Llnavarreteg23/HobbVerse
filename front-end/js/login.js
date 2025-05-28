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
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const passwordError = document.getElementById('password-error');
            
            if (!emailInput || !passwordInput) {
                console.error('Email or password input not found');
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            // Validaciones básicas
            if (!email || !password) {
                if (passwordError) {
                    passwordError.textContent = 'Por favor, complete todos los campos';
                }
                return;
            }
            
            // Obtener usuarios del localStorage
            const usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
            console.log('Número de usuarios encontrados:', usuarios.length);
            
            // Buscar usuario
            const usuario = usuarios.find(user => 
                user.email === email && user.password === password
            );
            
            if (usuario) {
                console.log('Usuario encontrado, iniciando sesión...');
                // Guardar sesión actual
                localStorage.setItem('current_user', JSON.stringify({
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono
                }));
                
                mostrarAlertaPersonalizada('¡Inicio de sesión exitoso!', 'success', () => {
                    window.location.href = '/index.html';
                });
            } else {
                console.log('Credenciales incorrectas');
                mostrarAlertaPersonalizada('Credenciales incorrectas', 'error');
                if (passwordError) {
                    passwordError.textContent = 'Email o contraseña incorrectos';
                }
            }
        });
    } else {
        console.error('Login form not found');
    }
});

function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    const alertContainer = document.createElement('div');
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
    
    alertContainer.innerHTML = `<p style="margin: 0; font-size: 18px;">${mensaje}</p>`;
    
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        document.body.removeChild(alertContainer);
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 2000);
}