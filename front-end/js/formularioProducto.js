document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = form.querySelector('input[placeholder="Nombre"]').value;
        const apellido = form.querySelector('input[placeholder="Apellido"]').value;
        const email = form.querySelector('input[placeholder="Email"]').value;
        const telefono = form.querySelector('input[placeholder="Teléfono"]').value;
        const mensaje = form.querySelector('textarea').value;
        
        // Validaciones
        if (!nombre || !apellido || !email || !telefono || !mensaje) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos del formulario.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Validar formato de email
        if (!validateEmail(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Email inválido',
                text: 'Por favor, ingresa una dirección de correo electrónico válida.',
                confirmButtonText: 'Corregir',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Validar formato de teléfono (solo números y mínimo 10 dígitos)
        if (!validatePhone(telefono)) {
            Swal.fire({
                icon: 'warning',
                title: 'Teléfono inválido',
                text: 'Por favor, ingresa un número de teléfono válido (mínimo 10 dígitos).',
                confirmButtonText: 'Corregir',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        // Si todo está correcto, mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Mensaje enviado!',
            text: 'Gracias por contactarnos. Te responderemos lo antes posible.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#28a745'
        }).then((result) => {
            if (result.isConfirmed) {
                form.reset(); // Limpiar el formulario
            }
        });
    });
});

// Función para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar teléfono
function validatePhone(phone) {
    const re = /^\d{10,}$/;
    return re.test(phone.replace(/\D/g, '')); // Elimina caracteres no numéricos antes de validar
}