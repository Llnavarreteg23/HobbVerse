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

// Claves para localStorage
const STORAGE_KEYS = {
    currentUser: 'current_user',
    products: 'hobbverse_products',
    categories: 'hobbverse_categories',
    cart: 'hobbverse_carrito',
    orders: 'hobbverse_orders',
    favorites: 'hobbverse_favorites',
    activities: 'hobbverse_activities'
};

// Estado global
let currentUser = null;
let userStats = { orders: 0, favorites: 0, points: 0 };
let allProducts = [];
let editingAddressId = null;
let addressModal = null;
let orderModal = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay usuario logueado
    currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
    if (!currentUser || !currentUser.isLoggedIn) {
        // Si no hay usuario logueado, redireccionar al login
        window.location.href = '/front-end/html/login.html';
        return;
    }

    // Cargar productos del catálogo
    loadAllProducts();

    // Inicializar modales
    addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));

    // Inicializar la aplicación
    initializeApp();
});

/**
 * Carga todos los productos disponibles desde localStorage
 */
function loadAllProducts() {
    try {
        const productsData = localStorage.getItem(STORAGE_KEYS.products);
        if (productsData) {
            allProducts = JSON.parse(productsData);
            console.log(`Se cargaron ${allProducts.length} productos del catálogo`);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        allProducts = [];
    }
    
    // Si no hay productos, cargar algunos de demostración
    if (!allProducts || allProducts.length === 0) {
        allProducts = generateDemoProducts();
        console.log('Se generaron productos de demostración');
    }
}

/**
 * Genera productos de demostración
 */
function generateDemoProducts() {
    return [
        { id: '1', name: 'Cámara Digital Pro', category: 'photography', price: 450000, description: 'Cámara digital de alta resolución', mainImage: 'https://via.placeholder.com/200x120?text=Cámara', stock: 10 },
        { id: '2', name: 'Set de Pinceles Profesionales', category: 'painting', price: 85000, description: 'Set completo de pinceles de alta calidad', mainImage: 'https://via.placeholder.com/200x120?text=Pinceles', stock: 20 },
        { id: '3', name: 'Auriculares Gaming RGB', category: 'gaming', price: 120000, description: 'Auriculares con sonido envolvente para gaming', mainImage: 'https://via.placeholder.com/200x120?text=Auriculares', stock: 15 },
        { id: '4', name: 'Kit de Jardinería Completo', category: 'gardening', price: 95000, description: 'Todo lo que necesitas para tu jardín', mainImage: 'https://via.placeholder.com/200x120?text=Jardinería', stock: 8 },
        { id: '5', name: 'Libro de Cocina Gourmet', category: 'cooking', price: 45000, description: 'Recetas gourmet paso a paso', mainImage: 'https://via.placeholder.com/200x120?text=Libro', stock: 25 },
        { id: '6', name: 'Equipo de Ejercicio Casero', category: 'fitness', price: 280000, description: 'Equipo completo para ejercitarte en casa', mainImage: 'https://via.placeholder.com/200x120?text=Fitness', stock: 5 },
        { id: '7', name: 'Guitarra Acústica', category: 'music', price: 350000, description: 'Guitarra acústica de calidad para principiantes y expertos', mainImage: 'https://via.placeholder.com/200x120?text=Guitarra', stock: 12 },
        { id: '8', name: 'Telescopio Astronómico', category: 'science', price: 520000, description: 'Observa las estrellas con este poderoso telescopio', mainImage: 'https://via.placeholder.com/200x120?text=Telescopio', stock: 3 },
        { id: '9', name: 'Set de Arcilla para Modelado', category: 'crafts', price: 65000, description: 'Arcilla profesional para tus creaciones', mainImage: 'https://via.placeholder.com/200x120?text=Arcilla', stock: 18 },
        { id: '10', name: 'Balón de Fútbol Profesional', category: 'sports', price: 90000, description: 'Balón oficial de competición', mainImage: 'https://via.placeholder.com/200x120?text=Balón', stock: 22 },
        { id: '11', name: 'Mapa Mundi Decorativo', category: 'travel', price: 120000, description: 'Mapa mundi detallado para marcar tus viajes', mainImage: 'https://via.placeholder.com/200x120?text=Mapa', stock: 14 },
        { id: '12', name: 'Curso de Programación Web', category: 'coding', price: 180000, description: 'Aprende desarrollo web desde cero', mainImage: 'https://via.placeholder.com/200x120?text=Curso', stock: 30 }
    ];
}

/**
 * Inicializa toda la aplicación
 */
function initializeApp() {
    // Cargar datos del usuario
    loadUserData();
    
    // Setup listeners
    setupMenuListeners();
    setupFormsListeners();
    setupAddressHandlers();
    setupHobbyHandlers();
    setupPasswordHandlers();
    
    // Cargar datos iniciales
    loadUserStats();
    loadDashboard();
    loadAddresses();
    loadOrders();
    loadFavorites();
    loadHobbies();
    
    // Inicializar tooltips y otros componentes
    initializeComponents();
    
    // Hacer visible la interfaz una vez cargada
    document.querySelector('main').style.opacity = '1';
    
    // Registrar actividad de login si es necesario
    if (!currentUser.lastLoginTime || (Date.now() - currentUser.lastLoginTime > 86400000)) { // 24 horas
        registerActivity('login', 'Iniciaste sesión');
        currentUser.lastLoginTime = Date.now();
        updateUserInStorage();
    }
}

/**
 * Carga y muestra los datos del usuario actual
 */
function loadUserData() {
    // Asegurarse de que existan todas las propiedades necesarias
    currentUser.orders = currentUser.orders || [];
    currentUser.favorites = currentUser.favorites || [];
    currentUser.addresses = currentUser.addresses || [];
    currentUser.hobbies = currentUser.hobbies || [];
    currentUser.points = currentUser.points || 0;
    currentUser.activities = currentUser.activities || [];
    currentUser.level = currentUser.level || 1;
    
    // Actualizar nombre y email en sidebar
    document.querySelector('.user-name').textContent = currentUser.nombre || 'Usuario';
    document.querySelector('.user-email').textContent = currentUser.email || '';
    
    // Llenar formulario de información personal
    document.getElementById('profileName').value = currentUser.nombre || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.telefono || '';
    document.getElementById('profileBirthdate').value = currentUser.fechaNacimiento || '';
    document.getElementById('profileGender').value = currentUser.genero || '';
    
    // Personalizar apariencia según preferencias del usuario
    if (currentUser.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

/**
 * Carga y muestra estadísticas del usuario
 */
function loadUserStats() {
    // Actualizar estadísticas del usuario
    const favorites = getFavoritesFromStorage();
    const orders = getOrdersFromStorage();
    
    userStats = {
        orders: orders.length,
        favorites: favorites.length,
        points: currentUser.points || 0
    };
    
    // Actualizar UI
    document.getElementById('totalOrders').textContent = userStats.orders;
    document.getElementById('totalFavorites').textContent = userStats.favorites;
    document.getElementById('totalPoints').textContent = userStats.points;
    
    // Actualizar nivel del usuario
    updateUserLevel();
}

/**
 * Actualiza el nivel del usuario y la barra de progreso
 */
function updateUserLevel() {
    const pointsPerLevel = 100;
    const level = Math.max(1, Math.floor(userStats.points / pointsPerLevel) + 1);
    const progress = (userStats.points % pointsPerLevel);
    const progressPercent = (progress / pointsPerLevel) * 100;
    
    // Actualizar el nivel y el porcentaje de la barra de progreso
    document.querySelector('.level-badge').textContent = `Explorador Nivel ${level}`;
    document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
    
    // Guardar nivel en usuario
    if (currentUser.level !== level) {
        currentUser.level = level;
        updateUserInStorage();
        
        // Mostrar notificación de subida de nivel
        if (level > 1) {
            mostrarAlertaPersonalizada(`¡Felicidades! Has alcanzado el nivel ${level}`, 'success');
            registerActivity('level-up', `Subiste al nivel ${level}`);
        }
    }
}

/**
 * Carga contenido del Dashboard
 */
function loadDashboard() {
    loadRecommendations();
    loadRecentActivity();
    loadAchievements();
}

/**
 * Carga recomendaciones personalizadas basadas en hobbies
 */
function loadRecommendations() {
    const container = document.getElementById('recommendationsCarousel');
    const userHobbies = currentUser.hobbies || [];
    
    // Generar recomendaciones basadas en hobbies
    const recommendations = generatePersonalizedRecommendations(userHobbies);
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Selecciona tus hobbies para ver recomendaciones personalizadas</p>';
        return;
    }
    
    container.innerHTML = recommendations.map(item => `
        <div class="recommendation-item" onclick="viewProduct('${item.id}')">
            <div class="recommendation-image">
                <img src="${item.mainImage || item.image}" alt="${item.name}">
                ${item.discount ? `<span class="discount-badge">-${item.discount}%</span>` : ''}
            </div>
            <h6>${item.name}</h6>
            <p class="price">${formatCurrency(item.price)}</p>
            <div class="recommendation-category">
                <span class="badge bg-light text-dark">
                    <i class="bi ${getCategoryIcon(item.category)}"></i> ${getCategoryName(item.category)}
                </span>
            </div>
            <button class="btn btn-sm btn-primary mt-2" onclick="addToCart('${item.id}'); event.stopPropagation();">
                <i class="bi bi-cart-plus"></i> Agregar
            </button>
        </div>
    `).join('');
    
    // Hacer global la función viewProduct
    window.viewProduct = viewProduct;
    window.addToCart = addToCart;
}

/**
 * Genera recomendaciones personalizadas basadas en los hobbies del usuario
 */
function generatePersonalizedRecommendations(userHobbies) {
    // Si no hay hobbies seleccionados, mostrar productos populares
    if (!userHobbies || userHobbies.length === 0) {
        return allProducts.slice(0, 6);
    }
    
    // Mapear hobbies a categorías de productos
    const hobbyToCategoryMap = {
        'reading': 'reading',
        'gaming': 'gaming',
        'cooking': 'cooking',
        'fitness': 'fitness',
        'photography': 'photography',
        'music': 'music',
        'gardening': 'gardening',
        'travel': 'travel',
        'painting': 'painting',
        'coding': 'coding',
        'crafts': 'crafts',
        'sports': 'sports'
    };
    
    // Filtrar productos que coincidan con los hobbies del usuario
    let matchingProducts = allProducts.filter(product => {
        const productCategory = product.category?.toLowerCase();
        return userHobbies.some(hobby => hobbyToCategoryMap[hobby] === productCategory);
    });
    
    // Si no hay suficientes productos, agregar algunos populares
    if (matchingProducts.length < 6) {
        const remainingNeeded = 6 - matchingProducts.length;
        const otherProducts = allProducts
            .filter(p => !matchingProducts.includes(p))
            .slice(0, remainingNeeded);
        
        matchingProducts = [...matchingProducts, ...otherProducts];
    }
    
    // Agregar descuentos aleatorios a algunos productos para hacerlos más atractivos
    return matchingProducts.slice(0, 6).map(product => {
        const hasDiscount = Math.random() > 0.5;
        return {
            ...product,
            discount: hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0
        };
    });
}

/**
 * Obtiene el icono para una categoría
 */
function getCategoryIcon(category) {
    if (!category) return 'bi-tag';
    
    const categoryMap = {
        'reading': 'bi-book',
        'gaming': 'bi-controller',
        'cooking': 'bi-egg-fried',
        'fitness': 'bi-bicycle',
        'photography': 'bi-camera',
        'music': 'bi-music-note',
        'gardening': 'bi-flower1',
        'travel': 'bi-airplane',
        'painting': 'bi-palette',
        'coding': 'bi-code-slash',
        'crafts': 'bi-scissors',
        'sports': 'bi-trophy',
        'science': 'bi-stars'
    };
    
    return categoryMap[category.toLowerCase()] || 'bi-tag';
}

/**
 * Obtiene el nombre amigable de una categoría
 */
function getCategoryName(category) {
    if (!category) return 'General';
    
    const nameMap = {
        'reading': 'Lectura',
        'gaming': 'Gaming',
        'cooking': 'Cocina',
        'fitness': 'Fitness',
        'photography': 'Fotografía',
        'music': 'Música',
        'gardening': 'Jardinería',
        'travel': 'Viajes',
        'painting': 'Pintura',
        'coding': 'Programación',
        'crafts': 'Manualidades',
        'sports': 'Deportes',
        'science': 'Ciencia'
    };
    
    return nameMap[category.toLowerCase()] || category;
}

/**
 * Ver detalles de un producto
 */
function viewProduct(productId) {
    console.log(`Ver producto: ${productId}`);
    
    // Aquí se podría implementar la redirección a la página de detalles
    // window.location.href = `/front-end/html/producto.html?id=${productId}`;
    
    // O abrir un modal con los detalles
    const product = allProducts.find(p => p.id == productId);
    if (product) {
        mostrarAlertaPersonalizada(`Viendo: ${product.name}`, 'info');
        registerActivity('view-product', `Viste ${product.name}`);
    }
}

/**
 * Agregar un producto al carrito
 */
function addToCart(productId) {
    console.log(`Agregar al carrito: ${productId}`);
    
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    // Cargar carrito actual
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.productoId == productId);
    
    if (existingItem) {
        // Incrementar cantidad
        existingItem.cantidad += 1;
    } else {
        // Agregar nuevo item
        cart.push({
            productoId: productId,
            nombre: product.name,
            precio: product.price,
            imagen: product.mainImage || product.image,
            cantidad: 1
        });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    
    // Mostrar notificación
    mostrarAlertaPersonalizada(`${product.name} agregado al carrito`, 'success');
    
    // Registrar actividad
    registerActivity('add-to-cart', `Agregaste ${product.name} al carrito`);
    
    // Dar puntos por agregar al carrito
    addUserPoints(5);
}

/**
 * Carga y muestra actividades recientes
 */
function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    const activities = getActivitiesFromStorage();
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay actividad reciente</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${getActivityIconClass(activity.type)}">
                <i class="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p class="mb-1">${activity.description}</p>
                <small class="text-muted">${formatActivityTime(activity.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

/**
 * Obtiene el icono para un tipo de actividad
 */
function getActivityIcon(type) {
    const icons = {
        'login': 'bi-box-arrow-in-right',
        'purchase': 'bi-bag-check',
        'view-product': 'bi-eye',
        'add-to-cart': 'bi-cart-plus',
        'add-favorite': 'bi-heart-fill',
        'remove-favorite': 'bi-heart',
        'profile-update': 'bi-person-check',
        'address-add': 'bi-geo-alt',
        'points-earned': 'bi-star-fill',
        'level-up': 'bi-award',
        'order-status': 'bi-truck',
        'security-update': 'bi-shield-lock'
    };
    
    return icons[type] || 'bi-clock-history';
}

/**
 * Obtiene la clase de color para el icono de actividad
 */
function getActivityIconClass(type) {
    const classes = {
        'login': 'bg-info',
        'purchase': 'bg-success',
        'view-product': 'bg-primary',
        'add-to-cart': 'bg-warning',
        'add-favorite': 'bg-danger',
        'remove-favorite': 'bg-secondary',
        'profile-update': 'bg-info',
        'address-add': 'bg-primary',
        'points-earned': 'bg-warning',
        'level-up': 'bg-success',
        'order-status': 'bg-info',
        'security-update': 'bg-danger'
    };
    
    return classes[type] || '';
}

/**
 * Formatea la fecha/hora de actividad en formato relativo
 */
function formatActivityTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Menos de un minuto
    if (diff < 60000) {
        return 'Hace unos segundos';
    }
    
    // Menos de una hora
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    // Menos de un día
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    // Menos de una semana
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    
    // Fecha exacta
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

/**
 * Registra una nueva actividad
 */
function registerActivity(type, description) {
    const activities = getActivitiesFromStorage();
    
    // Agregar nueva actividad al principio del array
    activities.unshift({
        id: Date.now().toString(),
        type: type,
        description: description,
        timestamp: Date.now()
    });
    
    // Mantener solo las últimas 20 actividades
    const trimmedActivities = activities.slice(0, 20);
    
    // Guardar en el usuario
    currentUser.activities = trimmedActivities;
    updateUserInStorage();
}

/**
 * Obtiene las actividades del usuario desde localStorage
 */
function getActivitiesFromStorage() {
    return currentUser.activities || [];
}

/**
 * Carga y muestra los logros del usuario
 */
function loadAchievements() {
    const container = document.getElementById('achievements');
    
    // Definir logros disponibles
    const achievements = [
        { 
            id: 'first-purchase', 
            icon: 'bi-trophy-fill', 
            title: 'Primera Compra', 
            description: 'Realizaste tu primera compra', 
            earned: userStats.orders > 0,
            points: 20
        },
        { 
            id: 'collector', 
            icon: 'bi-heart-fill', 
            title: 'Coleccionista', 
            description: '5 productos en favoritos', 
            earned: userStats.favorites >= 5,
            points: 30
        },
        { 
            id: 'explorer', 
            icon: 'bi-star-fill', 
            title: 'Explorador', 
            description: 'Alcanzaste 100 puntos', 
            earned: userStats.points >= 100,
            points: 50
        },
        { 
            id: 'loyal-customer', 
            icon: 'bi-award-fill', 
            title: 'Cliente Fiel', 
            description: '3 pedidos completados', 
            earned: userStats.orders >= 3,
            points: 40
        }
    ];
    
    // Verificar logros alcanzados y otorgar puntos si es necesario
    const earnedAchievements = currentUser.achievements || [];
    
    achievements.forEach(achievement => {
        if (achievement.earned && !earnedAchievements.includes(achievement.id)) {
            // Otorgar puntos por logro conseguido
            addUserPoints(achievement.points);
            earnedAchievements.push(achievement.id);
            
            // Mostrar notificación
            setTimeout(() => {
                mostrarAlertaPersonalizada(
                    `¡Logro desbloqueado: ${achievement.title}! +${achievement.points} puntos`, 
                    'success'
                );
            }, 1000);
            
            // Registrar actividad
            registerActivity('achievement', `Desbloqueaste el logro: ${achievement.title}`);
        }
    });
    
    // Guardar logros actualizados
    currentUser.achievements = earnedAchievements;
    updateUserInStorage();
    
    // Mostrar logros en la UI
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item ${achievement.earned ? 'earned' : 'locked'}">
            <div class="achievement-icon ${achievement.earned ? 'text-warning' : 'text-muted'}">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-content">
                <h6 class="mb-1">${achievement.title}</h6>
                <small class="text-muted">${achievement.description}</small>
                ${achievement.earned 
                    ? `<small class="text-success d-block">+${achievement.points} puntos</small>` 
                    : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Configura los listeners para el menú lateral
 */
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
                switch (this.dataset.section) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'favorites':
                        loadFavorites();
                        break;
                    case 'orders':
                        loadOrders();
                        break;
                    case 'hobbies':
                        updateSelectedHobbies();
                        break;
                }
            }
        });
    });
}

/**
 * Configura los listeners para los formularios
 */
function setupFormsListeners() {
    // Formulario de perfil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Guardar datos anteriores para comparar cambios
            const oldData = {
                nombre: currentUser.nombre,
                telefono: currentUser.telefono,
                fechaNacimiento: currentUser.fechaNacimiento,
                genero: currentUser.genero
            };
            
            // Actualizar datos del usuario
            currentUser.nombre = document.getElementById('profileName').value;
            currentUser.telefono = document.getElementById('profilePhone').value;
            currentUser.fechaNacimiento = document.getElementById('profileBirthdate').value;
            currentUser.genero = document.getElementById('profileGender').value;
            
            // Guardar en localStorage
            updateUserInStorage();
            
            // Actualizar UI
            document.querySelector('.user-name').textContent = currentUser.nombre;
            
            // Detectar si hubo cambios significativos
            const hasSignificantChanges = 
                oldData.nombre !== currentUser.nombre ||
                oldData.telefono !== currentUser.telefono ||
                oldData.fechaNacimiento !== currentUser.fechaNacimiento ||
                oldData.genero !== currentUser.genero;
            
            // Agregar puntos por actualizar perfil (solo si hubo cambios)
            if (hasSignificantChanges) {
                addUserPoints(10);
                registerActivity('profile-update', 'Actualizaste tu información personal');
            }
            
            mostrarAlertaPersonalizada('Información actualizada correctamente', 'success');
        });
    }
    
    // Formulario de seguridad
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validar formulario
            if (!currentPassword) {
                mostrarAlertaPersonalizada('Debes ingresar tu contraseña actual', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                mostrarAlertaPersonalizada('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                mostrarAlertaPersonalizada('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }
            
            // Validar contraseña actual
            if (currentPassword !== currentUser.password) {
                mostrarAlertaPersonalizada('La contraseña actual es incorrecta', 'error');
                return;
            }
            
            // Actualizar contraseña
            currentUser.password = newPassword;
            updateUserInStorage();
            
            // Registrar actividad
            registerActivity('security-update', 'Actualizaste tu contraseña');
            
            // Dar puntos por mejorar seguridad
            addUserPoints(15);
            
            // Limpiar formulario
            this.reset();
            updatePasswordStrength('');
            
            mostrarAlertaPersonalizada('Contraseña actualizada correctamente', 'success');
        });
    }
}

/**
 * Configura los manejadores para la vista de contraseñas y validación
 */
function setupPasswordHandlers() {
    // Validación de fortaleza de contraseña
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            updatePasswordStrength(e.target.value);
        });
    }
    
    // Hacer global la función togglePassword
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        
        // Cambiar el icono del botón
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (type === 'text') {
            icon.className = 'bi bi-eye-slash';
        } else {
            icon.className = 'bi bi-eye';
        }
    };
}

/**
 * Actualiza el indicador de fortaleza de contraseña
 */
function updatePasswordStrength(password) {
    const progressBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!progressBar || !strengthText) return;
    
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
        progressBar.className = 'progress-bar bg-danger';
    } else if (strength <= 50) {
        strengthLabel = 'Débil';
        progressBar.className = 'progress-bar bg-warning';
    } else if (strength <= 75) {
        strengthLabel = 'Media';
        progressBar.className = 'progress-bar bg-info';
    } else {
        strengthLabel = 'Fuerte';
        progressBar.className = 'progress-bar bg-success';
    }
    
    progressBar.style.width = `${Math.min(strength, 100)}%`;
    strengthText.textContent = `Fortaleza: ${strengthLabel}`;
}

/**
 * Configura los manejadores para direcciones
 */
function setupAddressHandlers() {
    // Botón agregar dirección
    const addAddressBtn = document.getElementById('addAddressBtn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {
            editingAddressId = null;
            document.getElementById('addressForm').reset();
            document.getElementById('modalTitle').textContent = 'Agregar Dirección';
            addressModal.show();
        });
    }
    
    // Guardar dirección
    const saveAddressBtn = document.getElementById('saveAddress');
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', function() {
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
    
    // Hacer globales las funciones de edición y eliminación
    window.editAddress = editAddress;
    window.deleteAddress = deleteAddress;
}

/**
 * Guarda una dirección en el perfil del usuario
 */
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
        
        // Registrar actividad solo para nuevas direcciones
        registerActivity('address-add', `Agregaste la dirección: ${address.name}`);
        
        // Dar puntos por agregar dirección
        addUserPoints(5);
    }
    
    // Guardar cambios
    updateUserInStorage();
    
    // Recargar listado
    loadAddresses();
    
    mostrarAlertaPersonalizada('Dirección guardada correctamente', 'success');
}

/**
 * Carga y muestra direcciones del usuario
 */
function loadAddresses() {
    const container = document.getElementById('addressesList');
    if (!container) return;
    
    if (!currentUser.addresses || currentUser.addresses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-geo-alt display-4 text-muted"></i>
                <p class="mt-3 text-muted">No has agregado direcciones todavía</p>
                <p class="text-muted small">Agrega direcciones para facilitar tus compras</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentUser.addresses.map(address => `
        <div class="address-card ${address.isDefault ? 'default' : ''}">
            ${address.isDefault 
                ? '<div class="default-badge"><i class="bi bi-check-circle-fill"></i> Predeterminada</div>' 
                : ''}
            <div class="address-content">
                <h5>${address.name}</h5>
                <p class="mb-1">${address.street}</p>
                <p class="mb-1">${address.city}, ${address.state} ${address.zip}</p>
                <p class="mb-0">Tel: ${address.phone}</p>
                ${address.notes ? `<p class="text-muted small mt-2"><i class="bi bi-info-circle"></i> ${address.notes}</p>` : ''}
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

/**
 * Edita una dirección existente
 */
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
    addressModal.show();
}

/**
 * Elimina una dirección
 */
function deleteAddress(id) {
    mostrarConfirmacion(
        '¿Estás seguro de eliminar esta dirección?',
        'Esta acción no se puede deshacer',
        () => {
            const addressToRemove = currentUser.addresses.find(addr => addr.id === id);
            const addressName = addressToRemove ? addressToRemove.name : 'dirección';
            
            currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== id);
            updateUserInStorage();
            loadAddresses();
            
            mostrarAlertaPersonalizada('Dirección eliminada correctamente', 'success');
            registerActivity('address-remove', `Eliminaste la dirección: ${addressName}`);
        }
    );
}

/**
 * Configura los manejadores para hobbies
 */
function setupHobbyHandlers() {
    loadAllHobbies();
    
    // Hacer global la función toggleHobby
    window.toggleHobby = toggleHobby;
}

/**
 * Carga todos los hobbies disponibles
 */
function loadAllHobbies() {
    const hobbySelection = document.getElementById('hobbySelection');
    if (!hobbySelection) return;
    
    // Agrupar hobbies por categoría
    const hobbiesByCategory = HOBBIES_DATA.reduce((acc, hobby) => {
        if (!acc[hobby.category]) acc[hobby.category] = [];
        acc[hobby.category].push(hobby);
        return acc;
    }, {});
    
    // Crear HTML para cada categoría
    let html = '';
    for (const [category, hobbies] of Object.entries(hobbiesByCategory)) {
        html += `
            <div class="hobby-category">
                <h6 class="hobby-category-title">${formatCategoryName(category)}</h6>
                <div class="hobby-items">
                    ${hobbies.map(hobby => `
                        <div class="hobby-item ${currentUser.hobbies?.includes(hobby.id) ? 'selected' : ''}"
                             data-hobby="${hobby.id}" onclick="toggleHobby('${hobby.id}')">
                            <i class="bi ${hobby.icon}"></i>
                            <span>${hobby.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    hobbySelection.innerHTML = html;
    updateSelectedHobbies();
}

/**
 * Formatea el nombre de una categoría
 */
function formatCategoryName(category) {
    const nameMap = {
        'tecnologia': 'Tecnología',
        'educacion': 'Educación',
        'hogar': 'Hogar',
        'deporte': 'Deportes',
        'arte': 'Arte y Creatividad',
        'aventura': 'Aventura',
        'ciencia': 'Ciencia'
    };
    
    return nameMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Alterna la selección de un hobby
 */
function toggleHobby(hobbyId) {
    if (!currentUser.hobbies) currentUser.hobbies = [];
    
    const index = currentUser.hobbies.indexOf(hobbyId);
    if (index >= 0) {
        currentUser.hobbies.splice(index, 1);
    } else {
        currentUser.hobbies.push(hobbyId);
        // Dar puntos por seleccionar nuevo hobby
        addUserPoints(2);
    }
    
    // Actualizar en localStorage
    updateUserInStorage();
    
    // Actualizar UI
    updateSelectedHobbies();
    
    // Actualizar elementos seleccionados
    document.querySelectorAll('.hobby-item').forEach(item => {
        if (item.dataset.hobby === hobbyId) {
            item.classList.toggle('selected');
        }
    });
    
    // Si cambiaron los hobbies, actualizar recomendaciones
    if (document.querySelector('#dashboard').classList.contains('active')) {
        loadRecommendations();
    }
    
    // Registrar actividad
    const hobby = HOBBIES_DATA.find(h => h.id === hobbyId);
    if (hobby) {
        if (index >= 0) {
            registerActivity('hobby-remove', `Quitaste ${hobby.name} de tus hobbies`);
        } else {
            registerActivity('hobby-add', `Agregaste ${hobby.name} a tus hobbies`);
        }
    }
}

/**
 * Actualiza la sección de hobbies seleccionados
 */
function updateSelectedHobbies() {
    const container = document.getElementById('selectedHobbies');
    if (!container) return;
    
    const selectedHobbies = currentUser.hobbies || [];
    
    if (selectedHobbies.length === 0) {
        container.innerHTML = `
            <div class="empty-hobbies">
                <p class="text-muted">No has seleccionado ningún hobby</p>
                <p class="text-muted small">Selecciona tus hobbies para recibir recomendaciones personalizadas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = selectedHobbies.map(hobbyId => {
        const hobby = HOBBIES_DATA.find(h => h.id === hobbyId);
        if (!hobby) return '';
        
        return `
            <div class="hobby-tag">
                <i class="bi ${hobby.icon}"></i>
                <span>${hobby.name}</span>
                <button class="btn-remove" onclick="toggleHobby('${hobbyId}'); event.stopPropagation();">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Carga pedidos del usuario
 */
function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    const orders = getOrdersFromStorage();
    
    // Manejar filtros
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    const searchFilter = document.getElementById('searchFilter')?.value || '';
    
    // Aplicar filtros
    let filteredOrders = orders;
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.toDateString() === filterDate.toDateString();
        });
    }
    
    if (searchFilter) {
        const search = searchFilter.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
            order.orderNumber.toLowerCase().includes(search) ||
            order.items.some(item => item.name.toLowerCase().includes(search))
        );
    }
    
    // Mostrar resultados
    if (filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-box display-4 text-muted"></i>
                <p class="mt-3 text-muted">No tienes pedidos${statusFilter ? ' con este estado' : ''}</p>
                <p class="text-muted small">Los pedidos que realices aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h5>Pedido #${order.orderNumber}</h5>
                    <p class="mb-0 text-muted">
                        <i class="bi bi-calendar3"></i> ${formatDate(order.date)}
                    </p>
                </div>
                <div class="order-status">
                    <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                </div>
            </div>
            <div class="order-body">
                <div class="order-items">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div>
                                <p class="mb-0">${item.name}</p>
                                <small>Cantidad: ${item.quantity}</small>
                            </div>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `
                        <div class="more-items">
                            <span>+${order.items.length - 2} más</span>
                        </div>
                    ` : ''}
                </div>
                <div class="order-summary">
                    <p class="mb-1"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
                    <p class="mb-0"><strong>Método:</strong> ${order.paymentMethod}</p>
                </div>
            </div>
            <div class="order-footer">
                <button class="btn btn-primary btn-sm" onclick="viewOrderDetails('${order.id}')">
                    <i class="bi bi-eye"></i> Ver detalles
                </button>
                ${order.status === 'Enviado' ? `
                    <button class="btn btn-success btn-sm" onclick="trackOrder('${order.id}')">
                        <i class="bi bi-truck"></i> Seguimiento
                    </button>
                ` : ''}
                ${order.status === 'Entregado' && !order.reviewed ? `
                    <button class="btn btn-outline-primary btn-sm" onclick="reviewOrder('${order.id}')">
                        <i class="bi bi-star"></i> Valorar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Hacer globales las funciones necesarias
    window.viewOrderDetails = viewOrderDetails;
    window.trackOrder = trackOrder;
    window.reviewOrder = reviewOrder;
    
    // Añadir listeners a los filtros
    setupOrderFilters();
}

/**
 * Configura los listeners para los filtros de pedidos
 */
function setupOrderFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', loadOrders);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', loadOrders);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(loadOrders, 300));
    }
}

/**
 * Limita la frecuencia de llamadas a una función
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Obtiene pedidos del localStorage
 */
function getOrdersFromStorage() {
    // Simular pedidos de ejemplo si no hay
    if (!currentUser.orders || currentUser.orders.length === 0) {
        return generateDemoOrders();
    }
    
    return currentUser.orders;
}

/**
 * Genera pedidos de demostración
 */
function generateDemoOrders() {
    const demoOrders = [
        {
            id: '1001',
            orderNumber: 'HV-10001',
            date: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 días atrás
            status: 'Entregado',
            items: [
                { id: '1', name: 'Cámara Digital Pro', image: 'https://via.placeholder.com/50x50?text=Cámara', quantity: 1, price: 450000 },
                { id: '5', name: 'Libro de Cocina Gourmet', image: 'https://via.placeholder.com/50x50?text=Libro', quantity: 2, price: 45000 }
            ],
            total: 540000,
            paymentMethod: 'Tarjeta de Crédito',
            shipping: {
                address: 'Calle 123 #45-67',
                city: 'Bogotá',
                method: 'Envío Estándar'
            },
            reviewed: false
        },
        {
            id: '1002',
            orderNumber: 'HV-10002',
            date: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 días atrás
            status: 'Entregado',
            items: [
                { id: '3', name: 'Auriculares Gaming RGB', image: 'https://via.placeholder.com/50x50?text=Auriculares', quantity: 1, price: 120000 }
            ],
            total: 120000,
            paymentMethod: 'Efectivo',
            shipping: {
                address: 'Avenida Principal #10-15',
                city: 'Medellín',
                method: 'Envío Express'
            },
            reviewed: true
        },
        {
            id: '1003',
            orderNumber: 'HV-10003',
            date: Date.now() - 1000 * 60 * 60 * 24, // 1 día atrás
            status: 'Enviado',
            items: [
                { id: '10', name: 'Balón de Fútbol Profesional', image: 'https://via.placeholder.com/50x50?text=Balón', quantity: 1, price: 90000 },
                { id: '11', name: 'Mapa Mundi Decorativo', image: 'https://via.placeholder.com/50x50?text=Mapa', quantity: 1, price: 120000 }
            ],
            total: 210000,
            paymentMethod: 'Transferencia Bancaria',
            shipping: {
                address: 'Carrera 30 #22-40',
                city: 'Cali',
                method: 'Envío Estándar'
            },
            tracking: {
                number: 'TRK123456789',
                carrier: 'Servientrega',
                url: '#',
                lastUpdate: Date.now() - 1000 * 60 * 60 * 12
            },
            reviewed: false
        }
    ];
    
    return demoOrders;
}

/**
 * Obtiene clase CSS para badge de estado del pedido
 */
function getStatusBadgeClass(status) {
    const statusClasses = {
        'Pendiente': 'bg-warning',
        'En proceso': 'bg-info',
        'Enviado': 'bg-primary',
        'Entregado': 'bg-success',
        'Cancelado': 'bg-danger'
    };
    
    return statusClasses[status] || 'bg-secondary';
}

/**
 * Formatea una fecha
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Ver detalles de un pedido
 */
function viewOrderDetails(orderId) {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        mostrarAlertaPersonalizada('Pedido no encontrado', 'error');
        return;
    }
    
    const modalBody = document.getElementById('orderModalBody');
    
    modalBody.innerHTML = `
        <div class="order-details">
            <div class="row">
                <div class="col-md-6">
                    <div class="order-info mb-4">
                        <h6>Información del Pedido</h6>
                        <p><strong>Número:</strong> ${order.orderNumber}</p>
                        <p><strong>Fecha:</strong> ${formatDate(order.date)}</p>
                        <p><strong>Estado:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></p>
                        <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="shipping-info mb-4">
                        <h6>Información de Envío</h6>
                        <p><strong>Dirección:</strong> ${order.shipping.address}</p>
                        <p><strong>Ciudad:</strong> ${order.shipping.city}</p>
                        <p><strong>Método:</strong> ${order.shipping.method}</p>
                        ${order.tracking ? `
                            <p><strong>Seguimiento:</strong> ${order.tracking.number}</p>
                            <p><strong>Transportadora:</strong> ${order.tracking.carrier}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="order-items-list mt-4">
                <h6>Productos</h6>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <div class="product-cell">
                                            <img src="${item.image}" alt="${item.name}">
                                            <span>${item.name}</span>
                                        </div>
                                    </td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                                <td>${formatCurrency(order.total - (order.shipping?.cost || 0))}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Envío:</strong></td>
                                <td>${formatCurrency(order.shipping?.cost || 0)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                <td class="fw-bold">${formatCurrency(order.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            ${order.status === 'Enviado' ? `
                <div class="tracking-info mt-4">
                    <h6>Seguimiento del Envío</h6>
                    <div class="tracking-timeline">
                        <div class="timeline-item active">
                            <div class="timeline-point"></div>
                            <div class="timeline-content">
                                <p class="mb-0"><strong>Pedido en preparación</strong></p>
                                <small>${formatDate(order.date)}</small>
                            </div>
                        </div>
                        <div class="timeline-item active">
                            <div class="timeline-point"></div>
                            <div class="timeline-content">
                                <p class="mb-0"><strong>Pedido enviado</strong></p>
                                <small>${formatDate(order.tracking.lastUpdate)}</small>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-point"></div>
                            <div class="timeline-content">
                                <p class="mb-0"><strong>En camino</strong></p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-point"></div>
                            <div class="timeline-content">
                                <p class="mb-0"><strong>Entregado</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    orderModal.show();
}

/**
 * Seguimiento de un pedido
 */
function trackOrder(orderId) {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.id === orderId);
    
    if (!order || !order.tracking) {
        mostrarAlertaPersonalizada('Información de seguimiento no disponible', 'error');
        return;
    }
    
    // Registrar actividad
    registerActivity('order-track', `Consultaste el seguimiento del pedido ${order.orderNumber}`);
    
    // Abrir página de seguimiento o mostrar modal
    viewOrderDetails(orderId);
}

/**
 * Valorar un pedido
 */
function reviewOrder(orderId) {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        mostrarAlertaPersonalizada('Pedido no encontrado', 'error');
        return;
    }
    
    // Aquí se implementaría el modal de valoración
    
    // Simulación
    order.reviewed = true;
    updateUserInStorage();
    
    // Registrar actividad
    registerActivity('review-order', `Valoraste tu pedido ${order.orderNumber}`);
    
    // Dar puntos por valoración
    addUserPoints(25);
    
    mostrarAlertaPersonalizada('¡Gracias por tu valoración! Has ganado 25 puntos', 'success');
    
    // Actualizar UI
    loadOrders();
}

/**
 * Carga y muestra favoritos del usuario
 */
function loadFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;
    
    const favorites = getFavoritesFromStorage();
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-heart display-4 text-muted"></i>
                <p class="mt-3 text-muted">No tienes productos favoritos</p>
                <p class="text-muted small">Agrega productos a favoritos para encontrarlos fácilmente</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favorites.map(product => `
        <div class="favorite-item">
            <div class="favorite-image">
                <img src="${product.mainImage || product.image}" alt="${product.name}">
                <button class="favorite-remove" onclick="removeFavorite('${product.id}')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="favorite-content">
                <h5>${product.name}</h5>
                <p class="price mb-2">${formatCurrency(product.price)}</p>
                <div class="favorite-actions">
                    <button class="btn btn-sm btn-primary" onclick="addToCart('${product.id}')">
                        <i class="bi bi-cart-plus"></i> Agregar al carrito
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewProduct('${product.id}')">
                        <i class="bi bi-eye"></i> Ver detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Hacer global la función removeFavorite
    window.removeFavorite = removeFavorite;
}

/**
 * Obtiene favoritos desde localStorage
 */
function getFavoritesFromStorage() {
    // Si no hay favoritos en el usuario, intentar buscarlos por ID en allProducts
    if (!currentUser.favorites || !Array.isArray(currentUser.favorites) || currentUser.favorites.length === 0) {
        return [];
    }
    
    // Si los favoritos son objetos completos, devolverlos
    if (typeof currentUser.favorites[0] === 'object') {
        return currentUser.favorites;
    }
    
    // Si son solo IDs, buscar los productos completos
    return currentUser.favorites.map(id => {
        const product = allProducts.find(p => p.id == id);
        return product || null;
    }).filter(product => product !== null);
}

/**
 * Elimina un producto de favoritos
 */
function removeFavorite(productId) {
    // Si favorites es un array de objetos
    if (typeof currentUser.favorites[0] === 'object') {
        currentUser.favorites = currentUser.favorites.filter(product => product.id != productId);
    } else {
        // Si favorites es un array de IDs
        currentUser.favorites = currentUser.favorites.filter(id => id != productId);
    }
    
    updateUserInStorage();
    loadFavorites();
    loadUserStats();
    
    // Registrar actividad
    const product = allProducts.find(p => p.id == productId);
    if (product) {
        registerActivity('remove-favorite', `Quitaste ${product.name} de favoritos`);
    }
    
    mostrarAlertaPersonalizada('Producto eliminado de favoritos', 'success');
}

/**
 * Inicializa componentes adicionales
 */
function initializeComponents() {
    // Inicializar tooltips de Bootstrap
    try {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } catch (e) {
        console.warn('Error al inicializar tooltips:', e);
    }
}

/**
 * Agrega puntos al usuario
 */
function addUserPoints(points) {
    const oldPoints = currentUser.points || 0;
    currentUser.points = oldPoints + points;
    
    updateUserInStorage();
    loadUserStats();
    
    // Registrar actividad solo si son puntos significativos
    if (points >= 10) {
        registerActivity('points-earned', `Ganaste ${points} puntos`);
    }
}

/**
 * Actualiza el usuario en localStorage
 */
function updateUserInStorage() {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
}

/**
 * Formatea un valor como moneda colombiana
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
}

/**
 * Muestra una alerta personalizada
 */
function mostrarAlertaPersonalizada(mensaje, tipo, callback) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `custom-alert-container ${tipo}`;
    
    alertContainer.innerHTML = `
        <div class="custom-alert">
            <div class="alert-icon">
                <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 
                               tipo === 'info' ? 'bi-info-circle-fill' : 
                               tipo === 'warning' ? 'bi-exclamation-triangle-fill' : 
                               'bi-x-circle-fill'}"></i>
            </div>
            <div class="alert-content">
                <span>${mensaje}</span>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Animar entrada
    setTimeout(() => {
        alertContainer.classList.add('show');
    }, 10);
    
    // Auto-cerrar después de un tiempo
    setTimeout(() => {
        if (document.body.contains(alertContainer)) {
            alertContainer.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(alertContainer)) {
                    alertContainer.remove();
                    if (callback) callback();
                }
            }, 300);
        }
    }, 4000);
}

/**
 * Muestra un diálogo de confirmación
 */
function mostrarConfirmacion(titulo, mensaje, onConfirm, onCancel) {
    const confirmContainer = document.createElement('div');
    confirmContainer.className = 'confirm-modal-backdrop';
    
    confirmContainer.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-header">
                <h5>${titulo}</h5>
                <button class="confirm-close" onclick="closeConfirmModal(this.parentElement.parentElement.parentElement)">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="confirm-body">
                <p>${mensaje}</p>
            </div>
            <div class="confirm-footer">
                <button class="btn btn-secondary" id="confirmCancel">Cancelar</button>
                <button class="btn btn-danger" id="confirmOk">Eliminar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmContainer);
    
    // Animar entrada
    setTimeout(() => {
        confirmContainer.classList.add('show');
    }, 10);
    
    // Configurar botones
    document.getElementById('confirmOk').addEventListener('click', function() {
        closeConfirmModal(confirmContainer);
        if (onConfirm) onConfirm();
    });
    
    document.getElementById('confirmCancel').addEventListener('click', function() {
        closeConfirmModal(confirmContainer);
        if (onCancel) onCancel();
    });
    
    // Hacer global la función de cerrar
    window.closeConfirmModal = function(container) {
        container.classList.remove('show');
        setTimeout(() => {
            container.remove();
        }, 300);
    };
}