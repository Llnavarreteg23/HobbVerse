//*  Elementos del formulario

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
    if (valor.length < 6) { // Cambiado a 6 para mantener consistencia con login.js
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

function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
    }
}

function limpiarErrores() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}

//* Boton registro

document.addEventListener('DOMContentLoaded', function() {
    const btnRegistrarse = document.getElementById('btnRegistrarse');
    
    if (!btnRegistrarse) {
        console.error('No se encontró el botón de registro');
        return;
    }
    
    btnRegistrarse.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validar campos usando las funciones individuales
        const nombreValido = validarNombre();
        const telefonoValido = validarTelefono();
        const emailValido = validarEmail();
        const passwordValido = validarPassword();
        const password2Valido = validarPassword2();

        // Solo continuar si todos los campos son válidos
        if (!(nombreValido && telefonoValido && emailValido && passwordValido && password2Valido)) {
            return;
        }

        // Crear objeto de usuario
        const usuario = {
            nombre: nombreInput.value.trim(),
            telefono: telefonoInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            fechaRegistro: new Date().toISOString()
        };

        // Obtener usuarios existentes o inicializar array
        let usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');

        // Verificar si el email ya está registrado
        if (usuarios.some(user => user.email === usuario.email)) {
            errorEmail.textContent = 'Este correo ya está registrado';
            return;
        }

        // Agregar nuevo usuario
        usuarios.push(usuario);
        localStorage.setItem('hobbverse_usuarios', JSON.stringify(usuarios));

        // Mostrar mensaje de éxito
        alert('¡Registro exitoso! Por favor, inicia sesión.');
        window.location.href = 'login.html';
    });
});