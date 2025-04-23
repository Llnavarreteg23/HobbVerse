
let nameField = document.getElementById("name");
let emailField = document.getElementById("email");
let phoneField = document.getElementById("phone");
let messageField = document.getElementById("message");
let submitButton = document.getElementById("submitButton");


submitButton.addEventListener("click", function (event) {
    event.preventDefault(); 

    if (nameField.value != "" || emailField.value != "" || phoneField.value != "" || messageField.value != "") {
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
    }else{
        let errorMessage = document.createElement("p");
        errorMessage.textContent = "Por favor, completa todos los campos.";
        errorMessage.style.color = "red";
        
        let submitMessageContainer = document.getElementById("submitMessageContainer");
        submitMessageContainer.innerHTML = "";
        submitMessageContainer.appendChild(errorMessage);
    }
});