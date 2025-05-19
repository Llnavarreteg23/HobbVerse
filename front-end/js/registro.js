// Código JavaScript para la validación del formulario de registro

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
    passwordInput.parentNode.insertAdjacentElement('afterend', requisitosPasswordContainer);

    // Funciones de validación
    function validarNombre() {
        const valor = nombreInput.value.trim();
        if (!valor) {
            errorNombre.textContent = '*El nombre es obligatorio.';
            return false;
        }
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!regex.test(valor)) {
            errorNombre.textContent = 'Solo se permiten letras y espacios.';
            return false;
        }
        errorNombre.textContent = '';
        return true;
    }

    function validarTelefono() {
        const valor = telefonoInput.value.trim();
        if (!valor) {
            errorTelefono.textContent = '*El teléfono es obligatorio.';
            return false;
        }
        const regex = /^\d{7,10}$/;
        if (!regex.test(valor)) {
            errorTelefono.textContent = 'El teléfono debe tener entre 7 y 10 dígitos numéricos.';
            return false;
        }
        errorTelefono.textContent = '';
        return true;
    }

    function validarEmail() {
        const valor = emailInput.value.trim();
        if (!valor) {
            errorEmail.textContent = '*El correo es obligatorio.';
            return false;
        }
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(valor)) {
            errorEmail.textContent = 'Correo electrónico inválido. Ejemplo: correo@email.com';
            return false;
        }
        errorEmail.textContent = '';
        return true;
    }

    function validarPassword() {
        const valor = passwordInput.value;
        let isValid = true;
        
        // Resetear mensajes
        passwordError.textContent = '';
        
        // Comprobar si está vacío
        if (!valor) {
            passwordError.textContent = '*La contraseña es obligatoria.';
            return false;
        }
        
        // Validar longitud mínima (7 caracteres)
        const tieneMinLongitud = valor.length >= 7;
        document.getElementById('req-longitud').style.color = tieneMinLongitud ? 'green' : 'red';
        isValid = isValid && tieneMinLongitud;
        
        // Validar al menos una mayúscula
        const tieneMayuscula = /[A-Z]/.test(valor);
        document.getElementById('req-mayuscula').style.color = tieneMayuscula ? 'green' : 'red';
        isValid = isValid && tieneMayuscula;
        
        // Validar al menos un número
        const tieneNumero = /[0-9]/.test(valor);
        document.getElementById('req-numero').style.color = tieneNumero ? 'green' : 'red';
        isValid = isValid && tieneNumero;
        
        // Validar al menos un carácter especial
        const tieneEspecial = /[!@#$%^&*]/.test(valor);
        document.getElementById('req-especial').style.color = tieneEspecial ? 'green' : 'red';
        isValid = isValid && tieneEspecial;
        
        if (!isValid) {
            passwordError.textContent = 'La contraseña no cumple con todos los requisitos.';
        }
        
        return isValid;
    }

    function validarPassword2() {
        const valor = password2Input.value;
        if (!valor) {
            password2Error.textContent = '*Confirma tu contraseña.';
            return false;
        }
        if (valor !== passwordInput.value) {
            password2Error.textContent = 'Las contraseñas no coinciden.';
            return false;
        }
        password2Error.textContent = '';
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
            // Probar diferentes rutas posibles
            const posiblesRutas = [
                './login.html',             
                '../html/login.html',       
                '/login.html',              
                '/front-end/html/login.html', 
                '/html/login.html'          
            ];
            
            console.log('Redirigiendo a login...');
            window.location.href = posiblesRutas[0];
        } catch (error) {
            console.error('Error en redirección:', error);
        }
    }

    // Validación en tiempo real
    nombreInput.addEventListener('input', validarNombre);
    telefonoInput.addEventListener('input', validarTelefono);
    emailInput.addEventListener('input', validarEmail);
    passwordInput.addEventListener('input', validarPassword);
    password2Input.addEventListener('input', validarPassword2);

    // Mostrar requisitos de contraseña al hacer focus
    passwordInput.addEventListener('focus', function() {
        requisitosPasswordContainer.style.display = 'block';
    });

    passwordInput.addEventListener('blur', function() {
        
    });

    // Funcionalidad mostrar/ocultar contraseña para ambos campos
    const togglePassword = document.getElementById('togglePassword');
    const togglePassword2 = document.getElementById('togglePassword2');

    // Función reutilizable para alternar visibilidad de contraseña
    function togglePasswordVisibility(toggleButton, inputField) {
        toggleButton.addEventListener('click', function() {
            const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
            inputField.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }

    // Aplicar la funcionalidad a ambos campos
    togglePasswordVisibility(togglePassword, passwordInput);
    togglePasswordVisibility(togglePassword2, password2Input);

    // Evento al hacer clic en el botón registrarse
    registrarBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        const isNombreValid = validarNombre();
        const isTelefonoValid = validarTelefono();
        const isEmailValid = validarEmail();
        const isPasswordValid = validarPassword();
        const isPassword2Valid = validarPassword2();

        // Si todas las validaciones son correctas
        if (isNombreValid && isTelefonoValid && isEmailValid && isPasswordValid && isPassword2Valid) {
            // Crear objeto con datos del usuario
            const userData = {
                id: Date.now(),
                nombre: nombreInput.value.trim(),
                email: emailInput.value.trim(),
                telefono: telefonoInput.value.trim(),
                password: passwordInput.value,
                fechaRegistro: new Date().toISOString()
            };

            // Obtener usuarios existentes
            let usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');

            // Verificar si el email ya existe
            if (usuarios.some(user => user.email === userData.email)) {
                errorEmail.textContent = 'Este correo ya está registrado';
                return;
            }

            // Agregar nuevo usuario
            usuarios.push(userData);

            // Guardar en localStorage
            localStorage.setItem('hobbverse_usuarios', JSON.stringify(usuarios));

            // Mostrar en consola el nuevo usuario
            console.log('Nuevo usuario registrado:', JSON.stringify(userData, null, 2));
            console.log('Registro exitoso');
            
            // Deshabilitar el botón de registro
            registrarBtn.disabled = true;

            // Mostrar alerta de éxito y redirigir
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Exitoso!',
                    text: 'Redirigiendo al login...',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    redirigirAlLogin();
                }).catch(error => {
                    console.error('Error con SweetAlert:', error);
                    redirigirAlLogin();
                });
            } else {
                mostrarAlertaPersonalizada('¡Registro Exitoso! Redirigiendo al login...', 'success', redirigirAlLogin);
            }
        } else {
            console.log('Error en la validación del formulario');
        }
    });
});