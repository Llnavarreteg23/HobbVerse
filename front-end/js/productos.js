// Claves para localStorage
const STORAGE_KEYS = {
    products: 'hobbverse_products',
    categories: 'hobbverse_categories',
    cart: 'hobbverse_carrito'
};

// Inicialización de variables DOM
const iconSelected = document.getElementById("iconSelected");
const hobbieaSelected = document.querySelector(".hobbieaSelected");
const hobbieClicked = document.getElementsByClassName("hobbiea");
const hobbieImageContainer = document.getElementById("hobbieImageContainer");

// Iconos para las categorías
const categoryIcons = {
    "lectura": "bi-book",
    "deportes": "bi-person-walking",
    "música": "bi-music-note",
    "pintura": "bi-palette",
    "videojuegos": "bi-controller",
    "peliculas": "bi-film",
    "crochet": "bi-scissors",
    "arte": "bi-palette",
    "juegos de mesa": "bi-dice-5",
    "coleccionables": "bi-collection"
};

// Formateador de moneda colombiana
export const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

/**
 * Carga los productos desde localStorage
 * @returns {Array} Lista de productos
 */
function cargarProductosDesdeStorage() {
    try {
        const productosJSON = localStorage.getItem(STORAGE_KEYS.products);
        if (productosJSON) {
            return JSON.parse(productosJSON);
        }
        return [];
    } catch (error) {
        console.error('Error al cargar productos desde localStorage:', error);
        return [];
    }
}

/**
 * Renderiza productos de una categoría específica
 * @param {string} category - ID de la categoría
 * @param {string} name - Nombre de la categoría
 */
export default async function renderCategory(category, name) {
    console.log(`Renderizando categoría: ${category} - ${name}`);
    
    // Cargar productos desde localStorage
    let allProducts = cargarProductosDesdeStorage();
    
    // Si no hay productos, intentar cargar cada 100ms por un máximo de 3 segundos
    let intentos = 0;
    const maxIntentos = 30; // 3 segundos
    
    while (allProducts.length === 0 && intentos < maxIntentos) {
        console.log(`Intento ${intentos + 1}: Esperando a que los productos estén disponibles...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        allProducts = cargarProductosDesdeStorage();
        intentos++;
    }
    
    if (allProducts.length === 0) {
        console.warn('No se pudieron cargar productos después de varios intentos');
    }
    
    console.log(`Productos cargados: ${allProducts.length}`);
    
    // Filtrar por categoría si se especifica
    const productosFiltrados = name 
        ? allProducts.filter(p => {
            const categoriaProducto = (p.category || p.categoria || '').toLowerCase();
            return categoriaProducto === name.toLowerCase();
        })
        : allProducts;
    
    console.log(`Productos filtrados para "${name}": ${productosFiltrados.length}`);
    
    // Limpiar el contenedor
    if (hobbieImageContainer) {
        hobbieImageContainer.innerHTML = "";
        
        if (productosFiltrados.length > 0) {
            // Crear tarjetas de productos
            productosFiltrados.forEach(producto => {
                const productId = producto.id || producto.idProducto;
                const productName = producto.name || producto.nombreProducto || 'Producto sin nombre';
                const productDesc = producto.description || producto.descripcion || '';
                const productPrice = producto.price || producto.precio || 0;
                const isFeatured = producto.featured || producto.destacado || false;
                
                const card = document.createElement("div");
                card.className = "producto-card";
                
                // Determinar la imagen principal y adicionales
                const mainImageUrl = producto.mainImage || producto.imagen || 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen';
                const additionalImages = producto.additionalImages || producto.imagenesAdicionales || [];
                
                // Solo crear carrusel si hay imágenes adicionales
                if (additionalImages.length > 0) {
                    // Crear indicadores del carrusel
                    let carouselIndicators = `
                        <button type="button" data-bs-target="#carousel-${productId}"
                                data-bs-slide-to="0" class="active" aria-current="true"></button>
                    `;
                    additionalImages.forEach((_, index) => {
                        carouselIndicators += `
                            <button type="button" data-bs-target="#carousel-${productId}"
                                    data-bs-slide-to="${index + 1}"></button>
                        `;
                    });
                    
                    // Crear elementos del carrusel
                    let carouselItems = `
                        <div class="carousel-item active">
                            <img src="${mainImageUrl}" class="d-block w-100"
                                    alt="${productName}" style="object-fit: cover; height: 200px;">
                        </div>
                    `;
                    additionalImages.forEach(img => {
                        carouselItems += `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional" 
                                     style="object-fit: cover; height: 200px;">
                            </div>
                        `;
                    });
                    
                    // Armar el carrusel completo
                    card.innerHTML = `
                        <div id="carousel-${productId}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${carouselIndicators}
                            </div>
                            <div class="carousel-inner">
                                ${carouselItems}
                            </div>
                            <button class="carousel-control-prev" type="button"
                                    data-bs-target="#carousel-${productId}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Anterior</span>
                            </button>
                            <button class="carousel-control-next" type="button"
                                    data-bs-target="#carousel-${productId}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Siguiente</span>
                            </button>
                        </div>
                        <div class="product-details">
                            <h3>${productName}</h3>
                            ${productDesc ? `<p>${productDesc}</p>` : ''}
                            <p class="price">${formatter.format(productPrice)}</p>
                            ${isFeatured ? '<span class="badge bg-warning">Destacado</span>' : ''}
                            <button class="buy-button" onclick="agregarAlCarrito('${productId}')">
                                <i class="bi bi-cart-plus"></i> Agregar al carrito
                            </button>
                        </div>
                    `;
                } else {
                    // Versión simple sin carrusel
                    card.innerHTML = `
                        <div class="position-relative">
                            <img src="${mainImageUrl}" class="producto-imagen" alt="${productName}">
                            ${isFeatured ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Destacado</span>' : ''}
                        </div>
                        <div class="product-details">
                            <h3>${productName}</h3>
                            ${productDesc ? `<p>${productDesc}</p>` : ''}
                            <p class="price">${formatter.format(productPrice)}</p>
                            <button class="buy-button" onclick="agregarAlCarrito('${productId}')">
                                <i class="bi bi-cart-plus"></i> Agregar al carrito
                            </button>
                        </div>
                    `;
                }
                
                hobbieImageContainer.appendChild(card);
                
                // Inicializar carrusel si es necesario
                if (additionalImages.length > 0) {
                    try {
                        const carouselElement = document.getElementById(`carousel-${productId}`);
                        if (carouselElement) {
                            new bootstrap.Carousel(carouselElement, {
                                interval: 3000,
                                touch: true
                            });
                        }
                    } catch (e) {
                        console.warn(`Error al inicializar carrusel para producto ${productId}:`, e);
                    }
                }
            });
        } else {
            // Mostrar mensaje si no hay productos
            hobbieImageContainer.innerHTML = `
                <div class="no-products">
                    <p>No hay productos disponibles en esta categoría.</p>
                </div>
            `;
        }
    } else {
        console.error('Elemento hobbieImageContainer no encontrado en el DOM');
    }
    
    // Actualizar ícono y título de categoría seleccionada
    if (category && name && iconSelected && hobbieaSelected) {
        // Obtener el ícono para la categoría o usar uno predeterminado
        const iconClass = categoryIcons[name.toLowerCase()] || 'bi-tag';
        iconSelected.className = `bi ${iconClass}`;
        hobbieaSelected.textContent = name;
    }
    
    // Hacer global la función agregarAlCarrito
    window.agregarAlCarrito = agregarAlCarrito;
}

// Configurar eventos para los enlaces de categoría
if (hobbieClicked && hobbieClicked.length > 0) {
    Array.from(hobbieClicked).forEach(link => {
        link.addEventListener("click", async function(event) {
            event.preventDefault();
            
            // Quitar selección de todos los enlaces
            Array.from(hobbieClicked).forEach(item => item.classList.remove("selected"));
            
            // Marcar este enlace como seleccionado
            this.classList.add("selected");
            
            // Obtener categoría y nombre
            const category = this.dataset.category;
            const name = this.textContent.trim();
            
            // Actualizar texto e ícono seleccionados
            if (hobbieaSelected) hobbieaSelected.textContent = name;
            
            if (iconSelected) {
                const iconClass = categoryIcons[category] || 'bi-tag';
                iconSelected.className = `bi ${iconClass}`;
            }
            
            // Renderizar productos de esta categoría
            await renderCategory(category, name);
        });
    });
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async function () {
    console.log("Página cargada, inicializando productos...");
    
    // Seleccionar la categoría predeterminada (Lectura)
    if (hobbieClicked && hobbieClicked.length > 0) {
        const defaultCategoryLink = Array.from(hobbieClicked).find(link => 
            link.textContent.trim().toLowerCase() === "lectura"
        );
        
        if (defaultCategoryLink) {
            defaultCategoryLink.classList.add("selected");
            
            if (hobbieaSelected) hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
            
            if (iconSelected) {
                const iconClass = categoryIcons[defaultCategoryLink.dataset.category] || 'bi-tag';
                iconSelected.className = `bi ${iconClass}`;
            }
        }
    }
    
    // Renderizar la categoría predeterminada
    await renderCategory("lectura", "Lectura");
    
    // Actualizar contador del carrito si existe
    actualizarContadorCarrito();
});

/**
 * Carga los productos destacados desde localStorage
 * @returns {Array} Array de productos destacados
 */
export function cargarProductosDestacados() {
    const productos = cargarProductosDesdeStorage();
    
    // Filtrar solo los productos destacados
    return productos.filter(producto => 
        producto.featured === true || 
        producto.destacado === true || 
        producto.featured === 'on' || 
        producto.destacado === 'on'
    );
}

/**
 * Agrega un producto al carrito de compras
 * @param {string} productoId - ID del producto a agregar
 */
export function agregarAlCarrito(productoId) {
    console.log("Agregando al carrito producto con ID:", productoId);
    
    try {
        // Cargar productos y carrito
        const productos = cargarProductosDesdeStorage();
        const carrito = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
        
        // Buscar el producto por ID
        const producto = productos.find(p => 
            (p.id == productoId) || (p.idProducto == productoId)
        );
        
        if (!producto) {
            console.error('Producto no encontrado:', productoId);
            alert('Error: Producto no encontrado');
            return;
        }
        
        // Extraer información normalizada del producto
        const nombre = producto.name || producto.nombreProducto;
        const precio = producto.price || producto.precio;
        const imagen = producto.mainImage || producto.imagen || 'https://via.placeholder.com/150';
        
        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.find(item => 
            (item.productoId == productoId) || (item.id == productoId)
        );
        
        if (itemExistente) {
            // Incrementar cantidad si ya existe
            itemExistente.cantidad += 1;
            console.log("Producto ya en carrito, cantidad aumentada:", itemExistente);
        } else {
            // Agregar nuevo item al carrito
            const nuevoItem = {
                productoId: productoId,
                id: productoId, // Para compatibilidad
                nombre: nombre,
                precio: precio,
                imagen: imagen,
                cantidad: 1
            };
            carrito.push(nuevoItem);
            console.log("Nuevo producto agregado al carrito:", nuevoItem);
        }
        
        // Guardar carrito actualizado
        localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(carrito));
        
        // Mostrar notificación
        mostrarNotificacion(`¡${nombre} agregado al carrito!`);
        
        // Actualizar contador
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        alert('Error al agregar el producto al carrito');
    }
}

/**
 * Actualiza el contador del carrito en la UI
 */
function actualizarContadorCarrito() {
    const contadorElement = document.querySelector('.cart-count');
    if (!contadorElement) return;
    
    try {
        const carrito = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        
        contadorElement.textContent = totalItems.toString();
        
        // Mostrar u ocultar según haya items
        if (totalItems > 0) {
            contadorElement.style.display = 'inline-block';
        } else {
            contadorElement.style.display = 'none';
        }
    } catch (e) {
        console.error('Error al actualizar contador del carrito:', e);
    }
}

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {boolean} esError - Si es un mensaje de error
 */
function mostrarNotificacion(mensaje, esError = false) {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center ${esError ? 'bg-danger' : 'bg-success'} text-white position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Inicializar y mostrar el toast
    try {
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        // Eliminar cuando se oculte
        toast.addEventListener('hidden.bs.toast', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    } catch (e) {
        console.error('Error al mostrar notificación:', e);
        // Fallback simple si bootstrap no está disponible
        toast.style.display = 'block';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

/**
 * Formatea un precio como moneda colombiana
 * @param {number} precio - El precio a formatear
 * @returns {string} El precio formateado
 */
export function formatearPrecioCOP(precio) {
    return formatter.format(precio);
}

/**
 * Carga todos los productos desde localStorage
 * @returns {Array} Array de todos los productos
 */
export function cargarTodosLosProductos() {
    return cargarProductosDesdeStorage();
}

/**
 * Renderiza los productos en el contenedor especificado
 * @param {string} categoria - Categoría para filtrar los productos (opcional)
 */
export async function renderizarProductos(categoria = null) {
    // Reutilizar la función principal
    await renderCategory(categoria, categoria);
}