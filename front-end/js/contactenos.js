// Script de control de formulario de contacto

let nameField = document.getElementById("name");
let emailField = document.getElementById("email");
let phoneField = document.getElementById("phone");
let messageField = document.getElementById("message");
let submitButton = document.getElementById("submitButton");

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
                let submitMessage = document.createElement("p");
                submitMessage.textContent = `${nameField.value}, gracias por contactarnos. Te responderemos lo más pronto posible.`;
                submitMessage.classList.add("submit-message");
                document.body.appendChild(submitMessage);

                setTimeout(() => {
                    submitMessage.remove();
                }, 5000);

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
            let errorMessage = document.createElement("p");
            errorMessage.textContent = "Ocurrió un error al enviar el formulario. Intenta nuevamente.";
            errorMessage.style.color = "red";
            document.body.appendChild(errorMessage);

            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        });

    } else {
        let errorMessage = document.createElement("p");
        errorMessage.textContent = "Por favor, completa todos los campos requeridos.";
        errorMessage.style.color = "red";
        document.body.appendChild(errorMessage);

        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
});





