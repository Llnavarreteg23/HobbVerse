document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay usuario logueado
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = '/front-end/html/login.html';
        return;
    }

    // Cargar datos del usuario
    loadUserData();
    
    // Setup listeners
    setupMenuListeners();
    setupFormsListeners();
    setupAddressHandlers();
    
    // Cargar datos iniciales
    loadAddresses();
    loadOrders();
});

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    // Actualizar nombre y email en sidebar
    document.querySelector('.user-name').textContent = currentUser.nombre;
    document.querySelector('.user-email').textContent = currentUser.email;
    
    // Llenar formulario de información personal
    document.getElementById('profileName').value = currentUser.nombre;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.telefono || '';
}

function setupMenuListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos los botones
            document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            document.querySelectorAll('.profile-section').forEach(section => section.classList.remove('active'));
            // Mostrar la sección correspondiente
            document.getElementById(this.dataset.section).classList.add('active');
        });
    });
}

function setupFormsListeners() {
    // Formulario de perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        currentUser.nombre = document.getElementById('profileName').value;
        currentUser.telefono = document.getElementById('profilePhone').value;
        
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        mostrarAlertaPersonalizada('Información actualizada correctamente', 'success');
    });
    
    // Formulario de seguridad
    document.getElementById('securityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            mostrarAlertaPersonalizada('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Aquí iría la lógica para cambiar la contraseña
        mostrarAlertaPersonalizada('Contraseña actualizada correctamente', 'success');
        this.reset();
    });
}

function setupAddressHandlers() {
    const addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    
    // Botón agregar dirección
    document.getElementById('addAddressBtn').addEventListener('click', () => {
        document.getElementById('addressForm').reset();
        addressModal.show();
    });
    
    // Guardar dirección
    document.getElementById('saveAddress').addEventListener('click', function() {
        const form = document.getElementById('addressForm');
        if (form.checkValidity()) {
            const address = {
                id: Date.now().toString(),
                name: document.getElementById('addressName').value,
                street: document.getElementById('addressStreet').value,
                city: document.getElementById('addressCity').value,
                zip: document.getElementById('addressZip').value,
                phone: document.getElementById('addressPhone').value
            };
            
            saveAddress(address);
            addressModal.hide();
            form.reset();
        } else {
            form.reportValidity();
        }
    });
}

function saveAddress(address) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser.addresses) currentUser.addresses = [];
    
    currentUser.addresses.push(address);
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    
    loadAddresses();
    mostrarAlertaPersonalizada('Dirección agregada correctamente', 'success');
}

function loadAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const container = document.getElementById('addressesList');
    
    if (!currentUser.addresses || currentUser.addresses.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay direcciones guardadas</p>';
        return;
    }
    
    container.innerHTML = currentUser.addresses.map(address => `
        <div class="address-card">
            <div class="address-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editAddress('${address.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress('${address.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <h5>${address.name}</h5>
            <p class="mb-1">${address.street}</p>
            <p class="mb-1">${address.city}, ${address.zip}</p>
            <p class="mb-0">Tel: ${address.phone}</p>
        </div>
    `).join('');
}

function loadOrders() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const container = document.getElementById('ordersList');
    
    if (!currentUser.orders || currentUser.orders.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay pedidos realizados</p>';
        return;
    }
    
    container.innerHTML = currentUser.orders.map(order => `
        <div class="order-card">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h5>Pedido #${order.id}</h5>
                    <p class="text-muted mb-0">Realizado el ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span>
            </div>
            <div class="order-products">
                ${order.products.map(product => `
                    <div class="order-product">
                        <img src="${product.mainImage}" alt="${product.name}">
                        <p class="small mb-0">${product.name}</p>
                        <p class="small text-muted">$${product.price.toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <p class="mb-0"><strong>Total:</strong> $${order.total.toLocaleString()}</p>
                <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                    Ver Detalles
                </button>
            </div>
        </div>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'Pendiente': 'warning',
        'En proceso': 'info',
        'Enviado': 'primary',
        'Entregado': 'success',
        'Cancelado': 'danger'
    };
    return colors[status] || 'secondary';
}

function deleteAddress(id) {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== id);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        loadAddresses();
        mostrarAlertaPersonalizada('Dirección eliminada correctamente', 'success');
    }
}

function editAddress(id) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const address = currentUser.addresses.find(addr => addr.id === id);
    
    if (address) {
        document.getElementById('addressName').value = address.name;
        document.getElementById('addressStreet').value = address.street;
        document.getElementById('addressCity').value = address.city;
        document.getElementById('addressZip').value = address.zip;
        document.getElementById('addressPhone').value = address.phone;
        
        const modal = new bootstrap.Modal(document.getElementById('addressModal'));
        modal.show();
    }
}