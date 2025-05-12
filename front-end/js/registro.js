//*  Referencio a los elementos del formulario

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
        errorTelefono.textContent = 'El teléfono debe tener entre 6 y 10 dígitos numéricos.';
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
    if (valor.length < 7) {
        errorPassword.textContent = 'La contraseña debe tener al menos 7 caracteres.';
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

//* Limpiar mensajes al cargar DOM



//* Encriptación de la contraseña

function encriptar(texto) {
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        resultado += String.fromCharCode(texto.charCodeAt(i));
    }
    return resultado;
}



//* Guardar y mostrar datos en localStorage

function guardarEnLocalStorage(data) {

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Evitar duplicados por email
    const existeUsuario = usuarios.some(u => u.email === data.email);
    if (existeUsuario) {
        alert('El correo ya está registrado.');
        return false; 
    }

    // Agregar nuevo usuario
    usuarios.push(data);

    // Guardar arreglo actualizado en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return true; // Indica que se guardó correctamente
}



//* Validación en tiempo real

nombreInput.addEventListener('blur', validarNombre);
telefonoInput.addEventListener('blur', validarTelefono);
emailInput.addEventListener('blur', validarEmail);
passwordInput.addEventListener('blur', validarPassword);
password2Input.addEventListener('blur', validarPassword2);

//* Boton registro

registrarBtn.addEventListener('click', function(event) {
    event.preventDefault();

    const esNombreValido = validarNombre();
    const esTelefonoValido = validarTelefono();
    const esEmailValido = validarEmail();
    const esPasswordValido = validarPassword();
    const esPassword2Valido = validarPassword2();

    if (esNombreValido && esTelefonoValido && esEmailValido && esPasswordValido && esPassword2Valido) {
        const userData = {
            nombre: nombreInput.value.trim(),
            telefono: telefonoInput.value.trim(),
            email: emailInput.value.trim(),
            password: encriptar(passwordInput.value)
        };

        const guardado = guardarEnLocalStorage(userData);
        if (guardado) {

            alert('¡Registro completado! El universo de tus hobbies te espera. ¡Descúbrelo!.');

            // Limpiar campos 
            nombreInput.value = '';
            telefonoInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            password2Input.value = '';
            errorNombre.textContent = '';
            errorTelefono.textContent = '';
            errorEmail.textContent = '';
            errorPassword.textContent = '';
            errorPassword2.textContent = '';
        }
        
    } else {
        alert('¡Ups! Parece que olvidamos algo. Por favor, asegúrate de llenar todos los campos.');
    }
});



