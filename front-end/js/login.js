document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alert-container');
    
    if (!loginForm) {
        console.error('No se encontró el formulario de login');
        return;
    }
    
    if (!alertContainer) {
        console.error('No se encontró el contenedor de alertas');
        // Crear el contenedor si no existe
        const alertDiv = document.createElement('div');
        alertDiv.id = 'alert-container';
        loginForm.parentNode.insertBefore(alertDiv, loginForm);
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Limpiar mensajes previos
        limpiarErrores();
        limpiarAlertas();

        // Validar campos
        if (!validarCampos(email, password)) {
            return;
        }

        try {
            // Obtener usuarios registrados
            const usuarios = JSON.parse(localStorage.getItem('hobbverse_usuarios') || '[]');
            
            console.log('Usuarios en localStorage:', usuarios);
            console.log('Intentando login con:', { email, password });

            // Buscar usuario
            const usuario = usuarios.find(user => user.email === email);

            if (!usuario) {
                mostrarAlerta('Usuario no registrado. Por favor, regístrate primero.', 'danger');
                return;
            }

            if (usuario.password !== password) {
                mostrarAlerta('Contraseña incorrecta. Por favor, intenta nuevamente.', 'danger');
                return;
            }

            // Guardar sesión
            localStorage.setItem('hobbverse_sesion_actual', JSON.stringify({
                email: usuario.email,
                nombre: usuario.nombre,
                fechaLogin: new Date().toISOString()
            }));

            // Mostrar mensaje de éxito
            mostrarAlerta('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

            // Esperar a que se muestre el mensaje antes de redireccionar
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Redireccionar
            window.location.href = '../html/index.html';

        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            mostrarAlerta('Ocurrió un error. Por favor, intenta nuevamente.', 'danger');
        }
    });
});

function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        console.error('No se encontró el contenedor de alertas');
        alert(mensaje);
        return;
    }
    
    alertContainer.innerHTML = ''; // Limpiar alertas previas
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);

    // Asegurar que la alerta sea visible
    alert.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function limpiarAlertas() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

function validarCampos(email, password) {
    let isValid = true;

    if (!email) {
        mostrarError('email-error', 'El correo electrónico es requerido');
        isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        mostrarError('email-error', 'Ingresa un correo electrónico válido');
        isValid = false;
    }

    if (!password) {
        mostrarError('password-error', 'La contraseña es requerida');
        isValid = false;
    } else if (password.length < 6) {
        mostrarError('password-error', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }

    return isValid;
}

function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
    } else {
        console.error(`Elemento de error no encontrado: ${elementId}`);
    }
}

function limpiarErrores() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}