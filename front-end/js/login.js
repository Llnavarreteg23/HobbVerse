document.addEventListener('DOMContentLoaded', function() {
    console.log('Login script loaded');
    
    // URL del backend - Ajustar según tu configuración
    const API_BASE_URL = 'http://localhost:8080'; // Cambiar por tu puerto de Spring Boot
    
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

    // Función para autenticar usuario en el backend
    async function autenticarUsuarioBackend(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('Login exitoso en backend:', data);
                return { success: true, usuario: data.usuario };
            } else {
                console.error('Error del backend:', data.error);
                return { success: false, error: data.error || 'Credenciales incorrectas' };
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    // Función de respaldo para autenticación local
    function autenticarUsuarioLocal(email, password) {
        // Verificar credenciales de admin
        if (email === 'AdminHobb@hobbverse.com' && password === 'HobbAdmin1') {
            return {
                success: true,
                usuario: {
                    email: email,
                    nombre: 'Administrador',
                    isAdmin: true
                }
            };
        }
        
        // Verificar usuarios normales en localStorage
        const usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
        const usuario = usuarios.find(user => 
            user.email === email && user.password === password
        );
        
        if (usuario) {
            return {
                success: true,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    isAdmin: false
                }
            };
        }
        
        return { success: false, error: 'Credenciales incorrectas' };
    }

    // Manejar envío del formulario de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Deshabilitar botón de submit
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Ingresando...';
            }

            // Intentar autenticación en el backend primero
            let result = await autenticarUsuarioBackend(email, password);
            
            // Si falla el backend, usar autenticación local como respaldo
            if (!result.success && result.error === 'Error de conexión con el servidor') {
                console.log('Backend no disponible, usando autenticación local');
                result = autenticarUsuarioLocal(email, password);
            }
            
            if (result.success) {
                const sessionData = {
                    id: result.usuario.id,
                    nombre: result.usuario.nombre,
                    email: result.usuario.email,
                    telefono: result.usuario.telefono,
                    isLoggedIn: true,
                    isAdmin: result.usuario.isAdmin || false
                };
                
                localStorage.setItem('current_user', JSON.stringify(sessionData));
                
                // Emitir evento de login exitoso
                const loginEvent = new Event('userLoggedIn');
                document.dispatchEvent(loginEvent);
                
                // Redirigir según el tipo de usuario
                const redirectUrl = result.usuario.isAdmin ? 
                    '/front-end/html/admin.html' : 
                    '/index.html';
                
                // Usar la función global de alerta si existe
                if (window.mostrarAlertaPersonalizada) {
                    window.mostrarAlertaPersonalizada(
                        result.usuario.isAdmin ? '¡Bienvenido Administrador!' : '¡Inicio de sesión exitoso!', 
                        'success', 
                        () => {
                            window.location.href = redirectUrl;
                        }
                    );
                } else {
                    // Crear función de alerta si no existe
                    const alertContainer = document.createElement('div');
                    alertContainer.style.position = 'fixed';
                    alertContainer.style.top = '20%';
                    alertContainer.style.left = '50%';
                    alertContainer.style.transform = 'translate(-50%, -50%)';
                    alertContainer.style.padding = '20px';
                    alertContainer.style.background = '#4CAF50';
                    alertContainer.style.color = 'white';
                    alertContainer.style.borderRadius = '5px';
                    alertContainer.style.textAlign = 'center';
                    alertContainer.style.zIndex = '1000';
                    alertContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    
                    alertContainer.innerHTML = `
                        <p style="margin: 0; font-size: 18px;">${result.usuario.isAdmin ? '¡Bienvenido Administrador!' : '¡Inicio de sesión exitoso!'}</p>
                    `;
                    
                    document.body.appendChild(alertContainer);
                    
                    setTimeout(() => {
                        document.body.removeChild(alertContainer);
                        window.location.href = redirectUrl;
                    }, 2000);
                }
            } else {
                // Mostrar error
                if (window.mostrarAlertaPersonalizada) {
                    window.mostrarAlertaPersonalizada(result.error, 'error');
                } else {
                    alert(result.error);
                }
                
                // Rehabilitar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Iniciar Sesión';
                }
            }
        });
    } else {
        console.error('Login form not found');
    }
});