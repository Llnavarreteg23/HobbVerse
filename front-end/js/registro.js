document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM
    const nombreInput = document.getElementById('nombreCompleto');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');
    const registrarBtn = document.getElementById('btnRegistrarse');

    const errorNombre = document.getElementById('errorNombre');
    const errorTelefono = document.getElementById('errorTelefono');
    const errorEmail = document.getElementById('errorEmail');
    const passwordError = document.getElementById('password-error');
    const password2Error = document.getElementById('password2-error');

    // URL del backend - Ajustar según tu configuración
    const API_BASE_URL = "https://9s68ixqgw5.us-east-1.awsapprunner.com";
    
    // Variable para controlar tiempo máximo de espera para el backend
    const BACKEND_TIMEOUT = 8000; // 8 segundos

    // Requisitos de contraseña
    const requisitosPasswordContainer = document.createElement('div');
    requisitosPasswordContainer.className = 'requisitos-password';
    requisitosPasswordContainer.style.display = 'none';
    requisitosPasswordContainer.innerHTML = `
        <p class="requisito-titulo">La contraseña debe contener:</p>
        <ul style="padding-left: 15px; margin-top: 5px;">
            <li id="req-longitud">Mínimo 7 caracteres</li>
            <li id="req-mayuscula">Al menos una mayúscula</li>
            <li id="req-numero">Al menos un número</li>
            <li id="req-especial">Al menos un carácter especial (!@#$%^&*)</li>
        </ul>
    `;
    
    // Insertar requisitos después del campo de contraseña
    if (passwordInput && passwordInput.parentNode) {
        passwordInput.parentNode.insertAdjacentElement('afterend', requisitosPasswordContainer);
    }

    // Funciones de validación
    function validarNombre() {
        if (!nombreInput) return false;
        const valor = nombreInput.value.trim();
        if (!valor) {
            if (errorNombre) errorNombre.textContent = '*El nombre es obligatorio.';
            return false;
        }
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regex.test(valor)) {
            if (errorNombre) errorNombre.textContent = 'Solo se permiten letras y espacios.';
            return false;
        }
        if (errorNombre) errorNombre.textContent = '';
        return true;
    }

    function validarTelefono() {
        if (!telefonoInput) return false;
        const valor = telefonoInput.value.trim();
        if (!valor) {
            if (errorTelefono) errorTelefono.textContent = '*El teléfono es obligatorio.';
            return false;
        }
        const regex = /^\d{7,10}$/;
        if (!regex.test(valor)) {
            if (errorTelefono) errorTelefono.textContent = 'El teléfono debe tener entre 7 y 10 dígitos numéricos.';
            return false;
        }
        if (errorTelefono) errorTelefono.textContent = '';
        return true;
    }

    function validarEmail() {
        if (!emailInput) return false;
        const valor = emailInput.value.trim();
        if (!valor) {
            if (errorEmail) errorEmail.textContent = '*El correo es obligatorio.';
            return false;
        }
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(valor)) {
            if (errorEmail) errorEmail.textContent = 'Correo electrónico inválido. Ejemplo: correo@email.com';
            return false;
        }
        if (errorEmail) errorEmail.textContent = '';
        return true;
    }

    function validarPassword() {
        const valor = passwordInput.value;
        let isValid = true;
        
        // Resetear mensajes
        if (passwordError) passwordError.textContent = '';
        
        // Comprobar si está vacío
        if (!valor) {
            if (passwordError) passwordError.textContent = '*La contraseña es obligatoria.';
            return false;
        }
        
        // Validar longitud mínima (7 caracteres)
        const tieneMinLongitud = valor.length >= 7;
        const reqLongitud = document.getElementById('req-longitud');
        if (reqLongitud) reqLongitud.style.color = tieneMinLongitud ? 'green' : 'red';
        isValid = isValid && tieneMinLongitud;
        
        // Validar al menos una mayúscula
        const tieneMayuscula = /[A-Z]/.test(valor);
        const reqMayuscula = document.getElementById('req-mayuscula');
        if (reqMayuscula) reqMayuscula.style.color = tieneMayuscula ? 'green' : 'red';
        isValid = isValid && tieneMayuscula;
        
        // Validar al menos un número
        const tieneNumero = /[0-9]/.test(valor);
        const reqNumero = document.getElementById('req-numero');
        if (reqNumero) reqNumero.style.color = tieneNumero ? 'green' : 'red';
        isValid = isValid && tieneNumero;
        
        // Validar al menos un carácter especial
        const tieneEspecial = /[!@#$%^&*]/.test(valor);
        const reqEspecial = document.getElementById('req-especial');
        if (reqEspecial) reqEspecial.style.color = tieneEspecial ? 'green' : 'red';
        isValid = isValid && tieneEspecial;
        
        if (!isValid && passwordError) {
            passwordError.textContent = 'La contraseña no cumple con todos los requisitos.';
        }
        
        return isValid;
    }

    function validarPassword2() {
        if (!password2Input) return false;
        const valor = password2Input.value;
        if (!valor) {
            if (password2Error) password2Error.textContent = '*Confirma tu contraseña.';
            return false;
        }
        if (valor !== passwordInput.value) {
            if (password2Error) password2Error.textContent = 'Las contraseñas no coinciden.';
            return false;
        }
        if (password2Error) password2Error.textContent = '';
        return true;
    }

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
        
        alertContainer.innerHTML = `
            <p style="margin: 0; font-size: 18px;">${mensaje}</p>
        `;
        
        document.body.appendChild(alertContainer);
        
        setTimeout(() => {
            document.body.removeChild(alertContainer);
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, 2000);
    }

    // Function to redirect to login
    function redirigirAlLogin() {
        try {
            console.log('Redirigiendo a login...');
            
            window.location.href = '/front-end/html/login.html';
        } catch (error) {
            console.error('Error en redirección:', error);
            // Intento alternativo si la ruta relativa falla
            try {
                window.location.href = 'login.html';
            } catch (e) {
                console.error('Error en redirección alternativa:', e);
            }
        }
    }

    // Función para verificar si un correo ya existe en localStorage
    function emailExisteEnLocalStorage(email) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
            return usuarios.some(user => user.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Error al verificar email en localStorage:', error);
            return false;
        }
    }

    // Función para registrar usuario en localStorage
    function registrarUsuarioLocalStorage(userData) {
        try {
            // Verificar si el correo ya existe
            if (emailExisteEnLocalStorage(userData.email)) {
                return {
                    success: false,
                    error: 'Este correo ya está registrado en el sistema'
                };
            }

            // Obtener usuarios existentes o inicializar array
            let usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
            
            // Crear nuevo usuario
            const nuevoUsuario = {
                id: Date.now(), // Generar ID único basado en timestamp
                nombre: userData.nombre,
                email: userData.email,
                telefono: userData.telefono,
                password: userData.password, // Nota: en producción debería cifrarse
                fechaRegistro: new Date().toISOString()
            };
            
            // Añadir a la lista
            usuarios.push(nuevoUsuario);
            
            // Guardar en localStorage
            localStorage.setItem('hobbverse_usuarios', JSON.stringify(usuarios));
            
            console.log('Usuario registrado en localStorage:', nuevoUsuario);
            
            return {
                success: true,
                data: {
                    usuario: nuevoUsuario,
                    message: 'Usuario registrado exitosamente en modo local'
                }
            };
        } catch (error) {
            console.error('Error al registrar en localStorage:', error);
            return {
                success: false,
                error: 'Error al guardar datos localmente: ' + error.message
            };
        }
    }

    // Función para registrar usuario en el backend con timeout
    async function registrarUsuarioBackend(userData) {
        // Crear una promesa con timeout
        const fetchWithTimeout = (url, options, timeout) => {
            return Promise.race([
                fetch(url, options),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout - El servidor tardó demasiado en responder')), timeout)
                )
            ]);
        };

        try {
            console.log('Enviando datos al backend:', userData);
            
            const response = await fetchWithTimeout(
                `${API_BASE_URL}/usuarios`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        nombreCompleto: userData.nombre,
                        email: userData.email,
                        telefono: userData.telefono,
                        contrasena: userData.password
                    })
                },
                BACKEND_TIMEOUT
            );

            console.log('Respuesta status:', response.status);
            
            // Leer la respuesta
            const responseText = await response.text();
            console.log('Respuesta raw:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                return { 
                    success: false, 
                    error: 'Error en el formato de respuesta del servidor' 
                };
            }
            
            console.log('Respuesta data:', data);
            
            if (response.ok && data.success) {
                return { success: true, data: data };
            } else {
                return { 
                    success: false, 
                    error: data.error || `Error del servidor: ${response.status}` 
                };
            }
            
        } catch (error) {
            console.error('Error de conexión:', error);
            
            // Verificar si es un error de CORS o de red o timeout
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.log('Error de conexión, usando localStorage como fallback');
                return registrarUsuarioLocalStorage(userData);
            }
            
            if (error.message.includes('Timeout')) {
                console.log('Timeout del servidor, usando localStorage como fallback');
                return registrarUsuarioLocalStorage(userData);
            }
            
            // Para cualquier otro error, intentar registro local
            console.log('Error desconocido, usando localStorage como fallback');
            return registrarUsuarioLocalStorage(userData);
        }
    }

    // Validación en tiempo real
    if (nombreInput) nombreInput.addEventListener('input', validarNombre);
    if (telefonoInput) telefonoInput.addEventListener('input', validarTelefono);
    if (emailInput) emailInput.addEventListener('input', validarEmail);
    if (passwordInput) passwordInput.addEventListener('input', validarPassword);
    if (password2Input) password2Input.addEventListener('input', validarPassword2);

    // Mostrar requisitos de contraseña al hacer focus
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            requisitosPasswordContainer.style.display = 'block';
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            // Mantener visible los requisitos si la contraseña no es válida
            if (!validarPassword()) {
                requisitosPasswordContainer.style.display = 'block';
            } else {
                setTimeout(() => {
                    requisitosPasswordContainer.style.display = 'none';
                }, 1000);
            }
        });
    }

    // Funcionalidad mostrar/ocultar contraseña para ambos campos
    const togglePassword = document.getElementById('togglePassword');
    const togglePassword2 = document.getElementById('togglePassword2');

    // Función reutilizable para alternar visibilidad de contraseña
    function togglePasswordVisibility(toggleButton, inputField) {
        if (toggleButton && inputField) {
            toggleButton.addEventListener('click', function() {
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-eye');
                    icon.classList.toggle('bi-eye-slash');
                }
            });
        }
    }

    // Aplicar la funcionalidad a ambos campos
    if (togglePassword && passwordInput) {
        togglePasswordVisibility(togglePassword, passwordInput);
    }
    if (togglePassword2 && password2Input) {
        togglePasswordVisibility(togglePassword2, password2Input);
    }

    // Evento al hacer clic en el botón registrarse
    if (registrarBtn) {
        registrarBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            console.log('Iniciando proceso de registro...');
            
            // Validar todos los campos
            const isNombreValid = validarNombre();
            const isTelefonoValid = validarTelefono();
            const isEmailValid = validarEmail();
            const isPasswordValid = validarPassword();
            const isPassword2Valid = validarPassword2();

            console.log('Validaciones:', {
                nombre: isNombreValid,
                telefono: isTelefonoValid,
                email: isEmailValid,
                password: isPasswordValid,
                password2: isPassword2Valid
            });

            // Si todas las validaciones son correctas
            if (isNombreValid && isTelefonoValid && isEmailValid && isPasswordValid && isPassword2Valid) {
                // Deshabilitar el botón de registro
                registrarBtn.disabled = true;
                registrarBtn.textContent = 'Registrando...';

                // Crear objeto con datos del usuario
                const userData = {
                    nombre: nombreInput.value.trim(),
                    email: emailInput.value.trim(),
                    telefono: telefonoInput.value.trim(),
                    password: passwordInput.value
                };

                console.log('Datos del usuario:', userData);

                // Intentar registrar en el backend con fallback a localStorage
                const result = await registrarUsuarioBackend(userData);
                
                console.log('Resultado del registro:', result);
                
                if (result.success) {
                    // Comprobar si fue registro de backend o local
                    const esRegistroLocal = result.data && result.data.message && 
                                          result.data.message.includes('modo local');
                    
                    // Si fue registro exitoso de backend, guardar también en localStorage como respaldo
                    if (!esRegistroLocal) {
                        try {
                            let usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
                            // Verificar si el email ya existe para evitar duplicados
                            if (!usuarios.some(u => u.email === userData.email)) {
                                const localUserData = {
                                    id: result.data.usuario ? result.data.usuario.id : Date.now(),
                                    nombre: userData.nombre,
                                    email: userData.email,
                                    telefono: userData.telefono,
                                    password: userData.password,
                                    fechaRegistro: new Date().toISOString()
                                };
                                usuarios.push(localUserData);
                                localStorage.setItem('hobbverse_usuarios', JSON.stringify(usuarios));
                                console.log('Usuario también guardado en localStorage como respaldo');
                            }
                        } catch (storageError) {
                            console.warn('Error al guardar en localStorage:', storageError);
                        }
                    }

                    console.log('Registro exitoso');
                    
                    // Mensaje personalizado según tipo de registro
                    const mensajeExito = esRegistroLocal ? 
                        '¡Registro Exitoso! Redirigiendo al login...' : 
                        '¡Registro Exitoso! Redirigiendo al login...';
                    
                    // Mostrar alerta de éxito y redirigir
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Registro Exitoso!',
                            text: esRegistroLocal ? 'Registro en modo local (sin conexión)' : 'Registro completado en el servidor',
                            footer: 'Redirigiendo al login...',
                            timer: 2500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        }).then(() => {
                            redirigirAlLogin();
                        }).catch(error => {
                            console.error('Error con SweetAlert:', error);
                            redirigirAlLogin();
                        });
                    } else {
                        mostrarAlertaPersonalizada(mensajeExito, 'success', redirigirAlLogin);
                    }
                } else {
                    console.log('Error en registro:', result.error);
                    
                    // Manejar errores específicos
                    if (result.error && result.error.includes('correo ya está registrado')) {
                        if (errorEmail) errorEmail.textContent = result.error;
                    } else {
                        mostrarAlertaPersonalizada(result.error || 'Error desconocido', 'error');
                    }
                    
                    // Rehabilitar el botón
                    registrarBtn.disabled = false;
                    registrarBtn.textContent = 'Registrarse';
                }
            } else {
                console.log('Error en la validación del formulario');
                mostrarAlertaPersonalizada('Por favor, corrige los errores en el formulario', 'error');
            }
        });
    } else {
        console.error('Botón de registro no encontrado');
    }
});