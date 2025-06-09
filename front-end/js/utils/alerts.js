export function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    // Crear el contenedor de la alerta si no existe
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        document.body.insertBefore(alertContainer, document.body.firstChild);
    }

    // Crear la alerta
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${getTipoAlerta(tipo)} alert-dismissible fade show`;
    alertElement.role = 'alert';
    
    // Agregar icono según el tipo
    const icono = getIconoAlerta(tipo);
    
    alertElement.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icono} me-2"></i>
            <div>${mensaje}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Agregar la alerta al contenedor
    alertContainer.appendChild(alertElement);

    // Remover la alerta después de 3 segundos
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
            if (callback) callback();
        }, 300);
    }, 3000);
}

function getTipoAlerta(tipo) {
    switch (tipo.toLowerCase()) {
        case 'success':
            return 'success';
        case 'error':
            return 'danger';
        case 'warning':
            return 'warning';
        case 'info':
            return 'info';
        default:
            return 'info';
    }
}

function getIconoAlerta(tipo) {
    switch (tipo.toLowerCase()) {
        case 'success':
            return 'bi-check-circle-fill';
        case 'error':
            return 'bi-x-circle-fill';
        case 'warning':
            return 'bi-exclamation-triangle-fill';
        case 'info':
            return 'bi-info-circle-fill';
        default:
            return 'bi-info-circle-fill';
    }
}