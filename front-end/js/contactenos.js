// Script de control de formulario de contacto

let nameField = document.getElementById("name");
let emailField = document.getElementById("email");
let phoneField = document.getElementById("phone");
let messageField = document.getElementById("message");
let submitButton = document.getElementById("submitButton");

// Agregar función para mostrar mensajes
function showMessage(message, type = 'success') {
    // Eliminar mensaje anterior si existe
    const oldMessage = document.querySelector('.alert-message');
    if (oldMessage) {
        oldMessage.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message ${type}`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Insertar después del formulario
    const form = document.querySelector('form');
    form.insertAdjacentElement('afterend', alertDiv);

    // Animación de entrada
    setTimeout(() => alertDiv.classList.add('show'), 10);

    // Remover después de 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Modificar el evento submit
submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (
        nameField.value !== "" &&
        emailField.value !== "" &&
        messageField.value !== ""
    ) {
        const formData = new FormData();
        formData.append("name", nameField.value);
        formData.append("email", emailField.value);
        formData.append("phone", phoneField.value);
        formData.append("message", messageField.value);

        fetch("https://formspree.io/f/mblojeya", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                showMessage(`${nameField.value}, gracias por contactarnos. Te responderemos lo más pronto posible.`, 'success');
                
                // Limpiar campos
                nameField.value = "";
                emailField.value = "";
                phoneField.value = "";
                messageField.value = "";
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || "Error al enviar");
                });
            }
        })
        .catch(error => {
            showMessage("Ocurrió un error al enviar el formulario. Intenta nuevamente.", 'error');
        });
    } else {
        showMessage("Por favor, completa todos los campos requeridos.", 'error');
    }
});





