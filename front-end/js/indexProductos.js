import { formatearPrecioCOP } from './productos.js';

// Constantes para localStorage
const STORAGE_KEYS = {
    products: 'hobbverse_products',
    categories: 'hobbverse_categories'
};

// API Endpoints
const API_ENDPOINTS = {
    products: '/api/productos',
    categories: '/api/categorias'
};

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cargar productos primero
        await cargarProductos();
        
        // Mostrar los productos en la UI
        mostrarProductosDestacadosPorCategoria();
        renderFeaturedProducts();
        
        // Hacer global la función agregarAlCarrito para los botones
        window.agregarAlCarrito = agregarAlCarrito;
    } catch (error) {
        console.error('Error al inicializar la página de productos:', error);
        mostrarErrorDeCarga();
    }
});

/**
 * Carga los productos desde el backend y localStorage
 */
async function cargarProductos() {
    try {
        // Intentar cargar desde la API primero
        const response = await fetch(API_ENDPOINTS.products);
        
        if (response.ok) {
            const productos = await response.json();
            console.log('Productos cargados desde la API:', productos);
            
            // Normalizar formato
            const productosNormalizados = normalizarProductos(productos);
            
            // Guardar en localStorage
            localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productosNormalizados));
            
            return productosNormalizados;
        } else {
            throw new Error(`Error al cargar productos desde la API: ${response.status}`);
        }
    } catch (error) {
        console.warn('No se pudieron cargar productos desde la API:', error);
        console.log('Intentando cargar desde localStorage...');
        
        // Intentar cargar desde localStorage como fallback
        const productosEnStorage = localStorage.getItem(STORAGE_KEYS.products);
        
        if (productosEnStorage) {
            const productos = JSON.parse(productosEnStorage);
            console.log('Productos cargados desde localStorage:', productos);
            return productos;
        } else {
            console.warn('No hay productos en localStorage. Usando datos de demostración.');
            
            // Productos de demostración como último recurso
            const productosDemostracion = [
                {
                    id: 1,
                    name: 'Balón de fútbol profesional',
                    category: 'Deportes',
                    description: 'Balón de fútbol de alta calidad para profesionales',
                    price: 120000,
                    stock: 50,
                    mainImage: 'https://via.placeholder.com/300x300?text=Balón+de+fútbol',
                    additionalImages: [
                        'https://via.placeholder.com/300x300?text=Balón+1',
                        'https://via.placeholder.com/300x300?text=Balón+2'
                    ],
                    featured: true
                },
                {
                    id: 2,
                    name: 'Set de pintura al óleo',
                    category: 'Arte',
                    description: 'Kit completo de pintura al óleo con 24 colores y pinceles',
                    price: 85000,
                    stock: 30,
                    mainImage: 'https://via.placeholder.com/300x300?text=Set+de+pintura',
                    additionalImages: [],
                    featured: true
                },
                {
                    id: 3,
                    name: 'Guitarra acústica',
                    category: 'Música',
                    description: 'Guitarra acústica de excelente calidad para principiantes y aficionados',
                    price: 250000,
                    stock: 15,
                    mainImage: 'https://via.placeholder.com/300x300?text=Guitarra',
                    additionalImages: [
                        'https://via.placeholder.com/300x300?text=Guitarra+1',
                        'https://via.placeholder.com/300x300?text=Guitarra+2'
                    ],
                    featured: true
                },
                {
                    id: 4,
                    name: 'Juego de ajedrez premium',
                    category: 'Juegos de mesa',
                    description: 'Ajedrez de madera con piezas talladas a mano',
                    price: 180000,
                    stock: 10,
                    mainImage: 'https://via.placeholder.com/300x300?text=Ajedrez',
                    additionalImages: [],
                    featured: false
                }
            ];
            
            // Guardar productos de demostración en localStorage
            localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productosDemostracion));
            
            return productosDemostracion;
        }
    }
}

/**
 * Normaliza el formato de los productos para manejar tanto inglés como español
 */
function normalizarProductos(productos) {
    return productos.map(producto => ({
        id: producto.id || producto.idProducto || Date.now().toString(),
        name: producto.name || producto.nombreProducto || '',
        category: producto.category || producto.categoria || '',
        description: producto.description || producto.descripcion || '',
        price: parseFloat(producto.price || (producto.precio ? producto.precio : 0)),
        stock: parseInt(producto.stock || producto.cantidad || 0),
        mainImage: producto.mainImage || producto.imagen || '',
        additionalImages: producto.additionalImages || producto.imagenesAdicionales || [],
        featured: producto.featured || producto.destacado || false
    }));
}

/**
 * Carga productos destacados desde localStorage
 */
function cargarProductosDestacados() {
    try {
        const productosEnStorage = localStorage.getItem(STORAGE_KEYS.products);
        
        if (productosEnStorage) {
            const productos = JSON.parse(productosEnStorage);
            return productos.filter(p => p.featured === true);
        }
        
        return [];
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
        return [];
    }
}

/**
 * Muestra productos destacados agrupados por categoría
 */
function mostrarProductosDestacadosPorCategoria() {
    try {
        const productosDestacados = cargarProductosDestacados();
        const contenedor = document.getElementById('productos-destacados-container');
        
        if (!contenedor) {
            console.warn('El contenedor "productos-destacados-container" no existe en el DOM');
            return;
        }

        if (!productosDestacados.length) {
            contenedor.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No hay productos destacados disponibles</p>
                </div>
            `;
            return;
        }

        // Agrupar productos por categoría
        const productosPorCategoria = productosDestacados.reduce((acc, producto) => {
            if (!acc[producto.category]) {
                acc[producto.category] = [];
            }
            acc[producto.category].push(producto);
            return acc;
        }, {});

        // Generar HTML para cada categoría
        const categoriasHTML = Object.entries(productosPorCategoria).map(([categoria, productos]) => `
            <div class="categoria-section mb-5">
                <h3 class="categoria-title mb-4">
                    <i class="bi bi-tag-fill me-2"></i>
                    ${categoria ? (categoria.charAt(0).toUpperCase() + categoria.slice(1)) : 'Sin categoría'}
                </h3>
                <div class="row g-4">
                    ${productos.map(producto => `
                        <div class="col-12 col-sm-6 col-lg-3">
                            <div class="card product-card h-100">
                                <div class="position-relative">
                                    <div id="carousel-${producto.id}" class="carousel slide" data-bs-ride="carousel">
                                        <div class="carousel-indicators">
                                            <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="0" class="active"></button>
                                            ${(producto.additionalImages || []).map((_, index) => `
                                                <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="${index + 1}"></button>
                                            `).join('')}
                                        </div>
                                        <div class="carousel-inner">
                                            <div class="carousel-item active">
                                                <img src="${producto.mainImage || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}" class="card-img-top" alt="${producto.name}">
                                            </div>
                                            ${(producto.additionalImages || []).map(img => `
                                                <div class="carousel-item">
                                                    <img src="${img}" class="card-img-top" alt="Imagen adicional de ${producto.name}">
                                                </div>
                                            `).join('')}
                                        </div>
                                        ${(producto.additionalImages || []).length > 0 ? `
                                            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="prev">
                                                <span class="carousel-control-prev-icon"></span>
                                            </button>
                                            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="next">
                                                <span class="carousel-control-next-icon"></span>
                                            </button>
                                        ` : ''}
                                    </div>
                                    <span class="badge bg-primary position-absolute top-0 start-0 m-3">
                                        ${producto.category || 'Sin categoría'}
                                    </span>
                                </div>
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${producto.name}</h5>
                                    <p class="card-text">${producto.description || 'Sin descripción'}</p>
                                    <div class="mt-auto">
                                        <p class="card-text">
                                            <strong>${formatearPrecioCOP(producto.price)}</strong>
                                        </p>
                                        <button class="btn btn-primary w-100" 
                                                onclick="agregarAlCarrito('${producto.id}')">
                                            <i class="bi bi-cart-plus"></i> Agregar al carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        contenedor.innerHTML = categoriasHTML;
        
        // Inicializar todos los carruseles
        setTimeout(() => {
            try {
                productosDestacados.forEach(producto => {
                    if (producto.additionalImages?.length > 0) {
                        const carouselElement = document.getElementById(`carousel-${producto.id}`);
                        if (carouselElement) {
                            new bootstrap.Carousel(carouselElement, {
                                interval: 3000
                            });
                        }
                    }
                });
            } catch (e) {
                console.warn('Error al inicializar carruseles:', e);
            }
        }, 100);

    } catch (error) {
        console.error('Error al mostrar productos destacados por categoría:', error);
        mostrarErrorDeCarga('productos-destacados-container');
    }
}

/**
 * Muestra productos destacados en la sección principal
 */
function renderFeaturedProducts() {
    try {
        const productos = cargarProductosDestacados();
        const featuredProducts = productos.filter(p => p.featured);
        const container = document.getElementById('featured-products');
        
        if (!container) {
            console.warn('El contenedor "featured-products" no existe en el DOM');
            return;
        }

        if (!featuredProducts.length) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No hay productos destacados disponibles</p>
                </div>
            `;
            return;
        }

        container.innerHTML = featuredProducts.map(producto => `
            <div class="producto-card featured" data-product-id="${producto.id}">
                <div id="featured-carousel-${producto.id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#featured-carousel-${producto.id}" data-bs-slide-to="0" class="active"></button>
                        ${(producto.additionalImages || []).map((_, index) => `
                            <button type="button" data-bs-target="#featured-carousel-${producto.id}" data-bs-slide-to="${index + 1}"></button>
                        `).join('')}
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="${producto.mainImage || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}" class="d-block w-100" alt="${producto.name}">
                        </div>
                        ${(producto.additionalImages || []).map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional de ${producto.name}">
                            </div>
                        `).join('')}
                    </div>
                    ${(producto.additionalImages || []).length > 0 ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#featured-carousel-${producto.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#featured-carousel-${producto.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    ` : ''}
                </div>
                <div class="product-details">
                    <h3>${producto.name}</h3>
                    <p>${producto.description || 'Sin descripción'}</p>
                    <p class="price">${formatearPrecioCOP(producto.price)}</p>
                    <button class="buy-button" onclick="agregarAlCarrito('${producto.id}')">
                        <i class="fas fa-shopping-cart"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        `).join('');

        // Inicializar todos los carruseles
        setTimeout(() => {
            try {
                featuredProducts.forEach(producto => {
                    if (producto.additionalImages?.length > 0) {
                        const carouselElement = document.getElementById(`featured-carousel-${producto.id}`);
                        if (carouselElement) {
                            new bootstrap.Carousel(carouselElement, {
                                interval: 3000
                            });
                        }
                    }
                });
            } catch (e) {
                console.warn('Error al inicializar carruseles destacados:', e);
            }
        }, 100);
    } catch (error) {
        console.error('Error al mostrar productos destacados en sección principal:', error);
        mostrarErrorDeCarga('featured-products');
    }
}

/**
 * Agrega un producto al carrito
 */
function agregarAlCarrito(idProducto) {
    try {
        console.log('Agregando al carrito producto con ID:', idProducto);
        
        // Cargar todos los productos
        const productosEnStorage = localStorage.getItem(STORAGE_KEYS.products);
        if (!productosEnStorage) {
            throw new Error('No hay productos disponibles');
        }
        
        const productos = JSON.parse(productosEnStorage);
        const producto = productos.find(p => p.id == idProducto);
        
        if (!producto) {
            throw new Error(`Producto con ID ${idProducto} no encontrado`);
        }
        
        // Cargar el carrito actual
        let carrito = [];
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
        
        // Verificar si el producto ya está en el carrito
        const productoEnCarrito = carrito.find(item => item.id == idProducto);
        
        if (productoEnCarrito) {
            // Si ya está, incrementar cantidad
            productoEnCarrito.cantidad += 1;
        } else {
            // Si no está, agregarlo con cantidad 1
            carrito.push({
                id: producto.id,
                nombre: producto.name,
                precio: producto.price,
                imagen: producto.mainImage,
                cantidad: 1
            });
        }
        
        // Guardar carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Mostrar confirmación
        mostrarNotificacion(`¡${producto.name} agregado al carrito!`);
        
        // Actualizar contador del carrito si existe
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        mostrarNotificacion('Error al agregar producto al carrito', true);
    }
}

/**
 * Muestra una notificación al usuario
 */
function mostrarNotificacion(mensaje, esError = false) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `toast align-items-center ${esError ? 'bg-danger' : 'bg-success'} text-white border-0 position-fixed bottom-0 end-0 m-3`;
    notificacion.setAttribute('role', 'alert');
    notificacion.setAttribute('aria-live', 'assertive');
    notificacion.setAttribute('aria-atomic', 'true');
    
    notificacion.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Inicializar toast de Bootstrap
    const toast = new bootstrap.Toast(notificacion, { delay: 3000 });
    toast.show();
    
    // Eliminar después de ocultarse
    notificacion.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(notificacion);
    });
}

/**
 * Actualiza el contador del carrito en la UI
 */
function actualizarContadorCarrito() {
    const contadorElement = document.getElementById('carrito-contador');
    if (!contadorElement) return;
    
    try {
        const carritoGuardado = localStorage.getItem('carrito');
        if (!carritoGuardado) {
            contadorElement.textContent = '0';
            return;
        }
        
        const carrito = JSON.parse(carritoGuardado);
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        contadorElement.textContent = totalItems.toString();
        
        // Hacer visible si hay items
        if (totalItems > 0) {
            contadorElement.classList.remove('d-none');
        } else {
            contadorElement.classList.add('d-none');
        }
    } catch (e) {
        console.error('Error al actualizar contador del carrito:', e);
    }
}

/**
 * Muestra un mensaje de error cuando falla la carga
 */
function mostrarErrorDeCarga(containerId = null) {
    const mensaje = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
            <p class="mt-3 text-danger">Error al cargar los productos. Por favor, intenta nuevamente más tarde.</p>
            <button class="btn btn-outline-primary mt-2" onclick="location.reload()">
                <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
        </div>
    `;
    
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = mensaje;
        }
    } else {
        // Actualizar todos los contenedores principales
        const contenedores = [
            'productos-destacados-container',
            'featured-products'
        ];
        
        contenedores.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = mensaje;
            }
        });
    }
}