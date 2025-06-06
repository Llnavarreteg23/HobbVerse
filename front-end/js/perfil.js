// Datos de hobbies disponibles
const HOBBIES_DATA = [
    { id: 'gaming', name: 'Gaming', icon: 'bi-controller', category: 'tecnologia' },
    { id: 'reading', name: 'Lectura', icon: 'bi-book', category: 'educacion' },
    { id: 'cooking', name: 'Cocina', icon: 'bi-egg-fried', category: 'hogar' },
    { id: 'fitness', name: 'Fitness', icon: 'bi-bicycle', category: 'deporte' },
    { id: 'photography', name: 'Fotografía', icon: 'bi-camera', category: 'arte' },
    { id: 'music', name: 'Música', icon: 'bi-music-note', category: 'arte' },
    { id: 'gardening', name: 'Jardinería', icon: 'bi-flower1', category: 'hogar' },
    { id: 'travel', name: 'Viajes', icon: 'bi-airplane', category: 'aventura' },
    { id: 'painting', name: 'Pintura', icon: 'bi-palette', category: 'arte' },
    { id: 'coding', name: 'Programación', icon: 'bi-code-slash', category: 'tecnologia' },
    { id: 'crafts', name: 'Manualidades', icon: 'bi-scissors', category: 'arte' },
    { id: 'sports', name: 'Deportes', icon: 'bi-trophy', category: 'deporte' }
];

// Estado global
let currentUser = null;
let userStats = { orders: 0, favorites: 0, points: 0 };

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay usuario logueado
    currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = '/front-end/html/login.html';
        return;
    }

    // Inicializar la aplicación
    initializeApp();
});

function initializeApp() {
    // Cargar datos del usuario
    loadUserData();
    
    // Setup listeners
    setupMenuListeners();
    setupFormsListeners();
    setupAddressHandlers();
    setupHobbyHandlers();
    
    // Cargar datos iniciales
    loadUserStats();
    loadDashboard();
    loadAddresses();
    loadOrders();
    loadFavorites();
    loadHobbies();
    
    // Inicializar tooltips y otros componentes
    initializeComponents();
}

function loadUserData() {
    // Actualizar nombre y email en sidebar
    document.querySelector('.user-name').textContent = currentUser.nombre || 'Usuario';
    document.querySelector('.user-email').textContent = currentUser.email || '';
    
    // Llenar formulario de información personal
    document.getElementById('profileName').value = currentUser.nombre || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.telefono || '';
    document.getElementById('profileBirthdate').value = currentUser.fechaNacimiento || '';
    document.getElementById('profileGender').value = currentUser.genero || '';
}

function loadUserStats() {
    // Calcular estadísticas del usuario
    const orders = currentUser.orders || [];
    const favorites = currentUser.favorites || [];
    const points = currentUser.points || 0;
    
    userStats = {
        orders: orders.length,
        favorites: favorites.length,
        points: points
    };
    
    // Actualizar UI
    document.getElementById('totalOrders').textContent = userStats.orders;
    document.getElementById('totalFavorites').textContent = userStats.favorites;
    document.getElementById('totalPoints').textContent = userStats.points;
    
    // Actualizar nivel del usuario
    updateUserLevel();
}

function updateUserLevel() {
    const level = Math.floor(userStats.points / 100) + 1;
    const progress = (userStats.points % 100);
    
    document.querySelector('.level-badge').textContent = `Explorador Nivel ${level}`;
    document.querySelector('.progress-bar').style.width = `${progress}%`;
}

function loadDashboard() {
    loadRecommendations();
    loadRecentActivity();
    loadAchievements();
}

function loadRecommendations() {
    const container = document.getElementById('recommendationsCarousel');
    const userHobbies = currentUser.hobbies || [];
    
    // Generar recomendaciones basadas en hobbies
    const recommendations = generateRecommendations(userHobbies);
    
    container.innerHTML = recommendations.map(item => `
        <div class="recommendation-item" onclick="viewProduct('${item.id}')">
            <img src="${item.image}" alt="${item.name}">
            <h6>${item.name}</h6>
            <p class="text-muted">$${item.price.toLocaleString()}</p>
            <small class="text-primary">${item.category}</small>
        </div>
    `).join('');
}

function generateRecommendations(userHobbies) {
    // Simulación de productos recomendados
    const products = [
        { id: 1, name: 'Cámara Digital Pro', price: 450000, image: 'https://via.placeholder.com/200x120?text=Cámara', category: 'Fotografía' },
        { id: 2, name: 'Set de Pinceles Profesionales', price: 85000, image: 'https://via.placeholder.com/200x120?text=Pinceles', category: 'Arte' },
        { id: 3, name: 'Auriculares Gaming RGB', price: 120000, image: 'https://via.placeholder.com/200x120?text=Auriculares', category: 'Gaming' },
        { id: 4, name: 'Kit de Jardinería Completo', price: 95000, image: 'https://via.placeholder.com/200x120?text=Jardinería', category: 'Hogar' },
        { id: 5, name: 'Libro de Cocina Gourmet', price: 45000, image: 'https://via.placeholder.com/200x120?text=Libro', category: 'Cocina' },
        { id: 6, name: 'Equipo de Ejercicio Casero', price: 280000, image: 'https://via.placeholder.com/200x120?text=Fitness', category: 'Deporte' }
    ];
    
    return products.slice(0, 6);
}

function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    const activities = [
        { icon: 'bi-box-seam', text: 'Pedido #12345 enviado', time: 'Hace 2 horas', type: 'order' },
        { icon: 'bi-heart-fill', text: 'Agregaste 3 productos a favoritos', time: 'Hace 1 día', type: 'favorite' },
        { icon: 'bi-star-fill', text: 'Ganaste 50 puntos', time: 'Hace 2 días', type: 'points' },
        { icon: 'bi-person-check', text: 'Perfil actualizado', time: 'Hace 3 días', type: 'profile' }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p class="mb-1">${activity.text}</p>
                <small class="text-muted">${activity.time}</small>
            </div>
        </div>
    `).join('');
}

function loadAchievements() {
    const container = document.getElementById('achievements');
    const achievements = [
        { icon: 'bi-trophy-fill', title: 'Primera Compra', description: 'Realizaste tu primera compra', earned: true },
        { icon: 'bi-heart-fill', title: 'Coleccionista', description: '10 productos en favoritos', earned: userStats.favorites >= 10 },
        { icon: 'bi-star-fill', title: 'Explorador', description: 'Alcanzaste 100 puntos', earned: userStats.points >= 100 },
        { icon: 'bi-award-fill', title: 'Fiel Cliente', description: '5 pedidos completados', earned: userStats.orders >= 5 }
    ];
    
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item ${achievement.earned ? 'earned' : 'locked'}">
            <div class="achievement-icon ${achievement.earned ? 'text-warning' : 'text-muted'}">
                <i class="${achievement.icon}"></i>
            </div>
            <h6 class="mb-1">${achievement.title}</h6>
            <small class="text-muted">${achievement.description}</small>
        </div>
    `).join('');
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
            const targetSection = document.getElementById(this.dataset.section);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Cargar datos específicos de la sección si es necesario
                if (this.dataset.section === 'dashboard') {
                    loadDashboard();
                } else if (this.dataset.section === 'favorites') {
                    loadFavorites();
                }
            }
        });
    });
}

function setupFormsListeners() {
    // Formulario de perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentUser.nombre = document.getElementById('profileName').value;
        currentUser.telefono = document.getElementById('profilePhone').value;
        currentUser.fechaNacimiento = document.getElementById('profileBirthdate').value;
        currentUser.genero = document.getElementById('profileGender').value;
        
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Actualizar UI
        document.querySelector('.user-name').textContent = currentUser.nombre;
        
        // Agregar puntos por actualizar perfil
        addUserPoints(10);
        
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
        
        if (newPassword.length < 8) {
            mostrarAlertaPersonalizada('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        // Aquí iría la lógica para cambiar la contraseña
        mostrarAlertaPersonalizada('Contraseña actualizada correctamente', 'success');
        this.reset();
        updatePasswordStrength('');
    });
    
    // Validación de fortaleza de contraseña
    document.getElementById('newPassword').addEventListener('input', function(e) {
        updatePasswordStrength(e.target.value);
    });
}

function updatePasswordStrength(password) {
    const progressBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!password) {
        progressBar.style.width = '0%';
        progressBar.className = 'progress-bar';
        strengthText.textContent = 'Ingresa una contraseña';
        return;
    }
    
    let strength = 0;
    let strengthLabel = '';
    
    // Criterios de fortaleza
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    // Determinar nivel y color
    if (strength <= 25) {
        strengthLabel = 'Muy débil';
        progressBar.className = 'progress-bar strength-weak';
    } else if (strength <= 50) {
        strengthLabel = 'Débil';
        progressBar.className = 'progress-bar strength-weak';
    } else if (strength <= 75) {
        strengthLabel = 'Media';
        progressBar.className = 'progress-bar strength-medium';
    } else {
        strengthLabel = 'Fuerte';
        progressBar.className = 'progress-bar strength-strong';
    }
    
    progressBar.style.width = `${Math.min(strength, 100)}%`;
    strengthText.textContent = `Fortaleza: ${strengthLabel}`;
}

function setupAddressHandlers() {
    const addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    let editingAddressId = null;
    
    // Botón agregar dirección
    document.getElementById('addAddressBtn').addEventListener('click', () => {
        editingAddressId = null;
        document.getElementById('addressForm').reset();
        document.getElementById('modalTitle').textContent = 'Agregar Dirección';
        addressModal.show();
    });
    
    // Guardar dirección
    document.getElementById('saveAddress').addEventListener('click', function() {
        const form = document.getElementById('addressForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const address = {
            id: editingAddressId || Date.now().toString(),
            name: document.getElementById('addressName').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            zip: document.getElementById('addressZip').value,
            state: document.getElementById('addressState').value,
            phone: document.getElementById('addressPhone').value,
            notes: document.getElementById('addressNotes').value,
            isDefault: document.getElementById('addressDefault').checked
        };
        
        saveAddress(address);
        addressModal.hide();
        form.reset();
    });
}

function saveAddress(address) {
    if (!currentUser.addresses) currentUser.addresses = [];
    
    // Si la dirección es predeterminada, quitar ese estado de las demás
    if (address.isDefault) {
        currentUser.addresses.forEach(addr => addr.isDefault = false);
    }
    
    // Actualizar o agregar dirección
    const index = currentUser.addresses.findIndex(addr => addr.id === address.id);
    if (index >= 0) {
        currentUser.addresses[index] = address;
    } else {
        currentUser.addresses.push(address);
    }
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    loadAddresses();
    mostrarAlertaPersonalizada('Dirección guardada correctamente', 'success');
}

function loadAddresses() {
    const container = document.getElementById('addressesList');
    
    if (!currentUser.addresses || currentUser.addresses.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay direcciones guardadas</p>';
        return;
    }
    
    container.innerHTML = currentUser.addresses.map(address => `
        <div class="address-card ${address.isDefault ? 'default' : ''}">
            <div class="address-badge">
                ${address.isDefault ? '<span class="badge bg-primary">Predeterminada</span>' : ''}
            </div>
            <div class="address-content">
                <h5>${address.name}</h5>
                <p class="mb-1">${address.street}</p>
                <p class="mb-1">${address.city}, ${address.state} ${address.zip}</p>
                <p class="mb-0">Tel: ${address.phone}</p>
                ${address.notes ? `<p class="text-muted small mt-2">${address.notes}</p>` : ''}
            </div>
            <div class="address-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editAddress('${address.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress('${address.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function editAddress(id) {
    const address = currentUser.addresses.find(addr => addr.id === id);
    if (!address) return;
    
    document.getElementById('modalTitle').textContent = 'Editar Dirección';
    document.getElementById('addressName').value = address.name;
    document.getElementById('addressStreet').value = address.street;
    document.getElementById('addressCity').value = address.city;
    document.getElementById('addressZip').value = address.zip;
    document.getElementById('addressState').value = address.state;
    document.getElementById('addressPhone').value = address.phone;
    document.getElementById('addressNotes').value = address.notes;
    document.getElementById('addressDefault').checked = address.isDefault;
    
    editingAddressId = id;
    const addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    addressModal.show();
}

function deleteAddress(id) {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
        currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== id);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        loadAddresses();
        mostrarAlertaPersonalizada('Dirección eliminada correctamente', 'success');
    }
}

function loadFavorites() {
    const container = document.getElementById('favoritesList');
    const favorites = currentUser.favorites || [];
    
    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes productos favoritos</p>';
        return;
    }
    
    container.innerHTML = favorites.map(product => `
        <div class="favorite-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="favorite-content">
                <h5>${product.name}</h5>
                <p class="text-primary mb-2">$${product.price.toLocaleString()}</p>
                <div class="favorite-actions">
                    <button class="btn btn-sm btn-primary" onclick="addToCart('${product.id}')">
                        <i class="bi bi-cart-plus"></i> Agregar al carrito
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFavorite('${product.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupHobbyHandlers() {
    const hobbySelection = document.getElementById('hobbySelection');
    
    // Cargar hobbies disponibles
    hobbySelection.innerHTML = HOBBIES_DATA.map(hobby => `
        <div class="hobby-item ${currentUser.hobbies?.includes(hobby.id) ? 'selected' : ''}"
             data-hobby="${hobby.id}" onclick="toggleHobby('${hobby.id}')">
            <i class="bi ${hobby.icon}"></i>
            <span>${hobby.name}</span>
        </div>
    `).join('');
}

function toggleHobby(hobbyId) {
    if (!currentUser.hobbies) currentUser.hobbies = [];
    
    const index = currentUser.hobbies.indexOf(hobbyId);
    if (index >= 0) {
        currentUser.hobbies.splice(index, 1);
    } else {
        currentUser.hobbies.push(hobbyId);
    }
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    updateSelectedHobbies();
    setupHobbyHandlers();
}

function updateSelectedHobbies() {
    const container = document.getElementById('selectedHobbies');
    const selectedHobbies = currentUser.hobbies || [];
    
    if (selectedHobbies.length === 0) {
        container.innerHTML = '<p class="text-muted">No has seleccionado ningún hobby</p>';
        return;
    }
    
    container.innerHTML = selectedHobbies.map(hobbyId => {
        const hobby = HOBBIES_DATA.find(h => h.id === hobbyId);
        return `
            <div class="hobby-tag">
                <i class="bi ${hobby.icon}"></i>
                ${hobby.name}
                <button class="btn-remove" onclick="toggleHobby('${hobbyId}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
    }).join('');
}

function initializeComponents() {
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function addUserPoints(points) {
    currentUser.points = (currentUser.points || 0) + points;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    loadUserStats();
}

// Función auxiliar para mostrar alertas personalizadas
function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert-container ${tipo}`;
    
    alertContainer.innerHTML = `
        <div class="custom-alert">
            <div class="alert-content">
                <i class="bi ${tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        alertContainer.remove();
        if (callback) callback();
    }, 2000);
}