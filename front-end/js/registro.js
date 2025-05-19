// Archivo: registro.js

const nombreInput = document.getElementById('nombreCompleto');
const telefonoInput = document.getElementById('telefono');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const password2Input = document.getElementById('password2');
const registrarBtn = document.getElementById('btnRegistrarse');

const errorNombre = document.getElementById('errorNombre');
const errorTelefono = document.getElementById('errorTelefono');
const errorEmail = document.getElementById('errorEmail');
const errorPassword = document.getElementById('errorPassword');
const errorPassword2 = document.getElementById('errorPassword2');

//*  Validaciones de cada campo

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
    if (!valor) {
        errorPassword.textContent = '*La contraseña es obligatoria.';
        return false;
    }
    if (valor.length < 6) {
        errorPassword.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return false;
    }
    errorPassword.textContent = '';
    return true;
}

function validarPassword2() {
    const valor = password2Input.value;
    if (!valor) {
        errorPassword2.textContent = '*Confirma tu contraseña.';
        return false;
    }
    if (valor !== passwordInput.value) {
        errorPassword2.textContent = 'Las contraseñas no coinciden.';
        return false;
    }
    errorPassword2.textContent = '';
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

document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const btnRegistrarse = document.getElementById('btnRegistrarse');
    
    // Comprobar si los elementos existen
    if (!btnRegistrarse) {
        console.error('No se encontró el botón de registro');
        return;
    }

    btnRegistrarse.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        const isNombreValid = validarNombre();
        const isTelefonoValid = validarTelefono();
        const isEmailValid = validarEmail();
        const isPasswordValid = validarPassword();
        const isPassword2Valid = validarPassword2();

        
        if (isNombreValid && isTelefonoValid && isEmailValid && isPasswordValid && isPassword2Valid) {
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

            // Deshabilitar el botón de registro
            btnRegistrarse.disabled = true;

            
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
        }
    });

    // Función para redirigir al login
    function redirigirAlLogin() {
        // Probar diferentes rutas posibles
        const posiblesRutas = [
            './login.html',             
            '../html/login.html',       
            '/login.html',              
            '/front-end/html/login.html', 
            '/html/login.html'          
        ];
        
        
        window.location.href = posiblesRutas[0];
    }

    // Agregar validación en tiempo real
    nombreInput.addEventListener('input', validarNombre);
    telefonoInput.addEventListener('input', validarTelefono);
    emailInput.addEventListener('input', validarEmail);
    passwordInput.addEventListener('input', validarPassword);
    password2Input.addEventListener('input', validarPassword2);

    // Funcionalidad mostrar/ocultar contraseña para ambos campos
    const togglePassword = document.getElementById('togglePassword');
    const togglePassword2 = document.getElementById('togglePassword2');
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');

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
});

function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.color = '#dc3545';
    }
}

function limpiarErrores() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}