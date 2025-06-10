import * as adminFunctions from '/front-end/js/admin.js';

const iconSelected = document.getElementById("iconSelected");
const hobbieaSelected = document.querySelector(".hobbieaSelected");
const hobbieClicked = document.getElementsByClassName("hobbiea");
const hobbieImageContainer = document.getElementById("hobbieImageContainer");

// **Mantenemos la configuración de la API del Backend aquí**
const API_BASE_URL = "https://9s68ixqgw5.us-east-1.awsapprunner.com";
const API_PRODUCT_BASE_URL = `${API_BASE_URL}/productos`; // Usamos esta para productos

const categoryIcons = {
    "lectura": "bi-book",
    "deportes": "bi-person-walking",
    "música": "bi bi-music-note",
    "pintura": "bi-palette",
    "videojuegos": "bi-controller",
    "peliculas": "bi-film",
    "crochet": "bi-scissors"
};

export default function renderCategory(category, name) {
    // Obtener productos
    const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
    const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');

    // Combinar productos y eliminar duplicados por ID
    const todosLosProductos = [...productosNuevos, ...productosAntiguos].reduce((acc, producto) => {
        if (!acc.find(p => p.id === producto.id)) {
            acc.push(producto);
        }
        return acc;
    }, []);

    // Filtrar por categoría si se especifica
    const productosFiltrados = name ? 
        todosLosProductos.filter(p => p.category.toLowerCase() === name.toLowerCase()) : 
        todosLosProductos;

    hobbieImageContainer.innerHTML = "";

    if (productosFiltrados.length > 0) {
        productosFiltrados.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.innerHTML = `
                <div id="carousel-${producto.id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#carousel-${producto.id}" 
                                data-bs-slide-to="0" class="active"></button>
                        ${(producto.additionalImages || []).map((_, index) => `
                            <button type="button" data-bs-target="#carousel-${producto.id}" 
                                    data-bs-slide-to="${index + 1}"></button>
                        `).join('')}
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="${producto.mainImage || producto.imagen}" class="d-block w-100" 
                                 alt="${producto.name || producto.nombre}">
                        </div>
                        ${(producto.additionalImages || []).map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional">
                            </div>
                        `).join('')}
                    </div>
                    ${(producto.additionalImages || []).length > 0 ? `
                        <button class="carousel-control-prev" type="button" 
                                data-bs-target="#carousel-${producto.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                            <span class="visually-hidden">Anterior</span>
                        </button>
                        <button class="carousel-control-next" type="button" 
                                data-bs-target="#carousel-${producto.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    ` : ''}
                </div>
                <div class="product-details">
                    <h3>${producto.name || producto.nombre}</h3>
                    ${producto.description ? `<p>${producto.description}</p>` : ''}
                    <p class="price">$${(producto.price || producto.precio).toLocaleString()}</p>
                    ${producto.featured ? '<span class="badge bg-warning">Destacado</span>' : ''}
                    <button class="buy-button" onclick="agregarAlCarrito('${producto.id}')">
                        Agregar al carrito
                    </button>
                </div>
            `;
            hobbieImageContainer.appendChild(card);
        });
    } else {
        hobbieImageContainer.innerHTML = `
            <div class="no-products">
                <p>No hay productos disponibles en esta categoría</p>
            </div>
        `;
    }

    // Actualizar ícono y título de categoría seleccionada
    if (category && name) {
        iconSelected.className = `bi ${categoryIcons[name.toLowerCase()] || 'bi-tag'}`;
        hobbieaSelected.textContent = name;
    }
}

Array.from(hobbieClicked).forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        Array.from(hobbieClicked).forEach(item => item.classList.remove("selected"));

        this.classList.add("selected");

        const category = this.dataset.category;
        const name = this.textContent.trim();

        hobbieaSelected.textContent = name;

        iconSelected.className = categoryIcons[category];

        renderCategory(category, name);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("Página cargada, verificando productos en localStorage...");
    
    const defaultCategoryLink = Array.from(hobbieClicked).find(link => link.textContent.trim() === "Lectura");

    if (defaultCategoryLink) {
        defaultCategoryLink.classList.add("selected");

        hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
        iconSelected.className = categoryIcons[defaultCategoryLink.dataset.category];
    }

    renderCategory("lectura", "Lectura");
});

/**
 * Carga los productos destacados desde el almacenamiento local
 * @returns {Array} Array de productos destacados
 */
export function cargarProductosDestacados() {
    // Obtener productos del almacenamiento local
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    
    if (!productos.length) {
        productos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
    }
    
    // Filtra solo los productos destacados
    const destacados = productos.filter(producto => 
        producto.featured === true || producto.featured === 'on' || producto.featured === 'true'
    );
    
    return destacados;
}

/**
 * Agrega un producto al carrito de compras.
 * Ahora obtiene los detalles del producto desde el backend por su ID.
 * @param {string} productoId - ID del producto a agregar.
 */
export async function agregarAlCarrito(productoId) { // <<< Cambiado a 'async'
    const carrito = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
    
    try {
        // Obtiene los detalles completos del producto desde el backend usando el endpoint /productos/{id}
        const response = await fetch(`${API_PRODUCT_BASE_URL}/${productoId}`); 
        if (!response.ok) {
            throw new Error(`Error al obtener el producto (ID: ${productoId}): ${response.statusText}`);
        }
        const producto = await response.json();

        if (producto) {
            // Intenta obtener las URLs de las imágenes de localStorage para el carrito
            // Esto es crucial para mantener la lógica de imágenes de adminFunctions.getProductImagesFromLocalStorage
            const localImages = adminFunctions.getProductImagesFromLocalStorage(producto.idProducto || producto.id); // Usar producto.idProducto o producto.id

            const itemExistente = carrito.find(item => (item.productoId == productoId)); // Asegúrate de que la comparación sea correcta
            
            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({
                    productoId: producto.idProducto || producto.id, // Usar producto.idProducto o producto.id
                    nombre: producto.nombreProducto || producto.name, // Usar nombreProducto o name
                    precio: producto.precio || producto.price, // Usar precio o price
                    // La imagen ahora viene de localImages o un placeholder
                    imagen: (localImages && localImages.mainImage) ? localImages.mainImage : (producto.mainImage || 'https://via.placeholder.com/50x50?text=Img'), 
                    cantidad: 1
                });
            }
            
            localStorage.setItem('hobbverse_carrito', JSON.stringify(carrito));
            alert('Producto agregado al carrito');
        } else {
            console.error('Producto no encontrado en el backend con ID:', productoId);
        }
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        alert('Hubo un error al agregar el producto al carrito. Por favor, inténtalo de nuevo.');
    }
}

/**
 * Formatea un precio como moneda colombiana
 * @param {number} precio - El precio a formatear
 * @returns {string} El precio formateado
 */
export function formatearPrecioCOP(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio);
}

/**
 * Carga todos los productos desde el almacenamiento local
 * @returns {Array} Array de todos los productos
 */
export function cargarTodosLosProductos() {
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    return productos;
}

/**
 * Renderiza los productos en el contenedor especificado
 * @param {string} categoria - Categoría para filtrar los productos (opcional)
 */
export function renderizarProductos(categoria = null) {
    const productos = cargarTodosLosProductos();
    const productosFiltrados = categoria ? 
        productos.filter(p => p.category.toLowerCase() === categoria.toLowerCase()) : 
        productos;

    const contenedor = document.getElementById('hobbieImageContainer');
    
    if (!productosFiltrados.length) {
        contenedor.innerHTML = '<p class="text-center">No hay productos disponibles</p>';
        return;
    }

    contenedor.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card ${producto.featured ? 'featured' : ''}">
            <div class="position-relative">
                <img src="${producto.mainImage}" alt="${producto.name}">
                ${producto.featured ? 
                    '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Destacado</span>' 
                    : ''}
            </div>
            <div class="product-details">
                <h3>${producto.name}</h3>
                <p>${producto.description}</p>
                <p class="price">$${producto.price.toLocaleString()}</p>
                <button class="buy-button" onclick="agregarAlCarrito('${producto.id}')">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
}

function renderProducts(products) {
    const container = document.getElementById('hobbieImageContainer');
    container.innerHTML = products.map(product => `
        <div class="producto-card">
            <img src="${product.mainImage || product.imagen}" alt="${product.name || product.nombre}">
            <div class="product-details">
                <h3>${product.name || product.nombre}</h3>
                <p>${product.description || ''}</p>
                <p class="price">$${(product.price || product.precio).toLocaleString()}</p>
                <button class="buy-button" onclick="window.floatingCart.addToCart(${JSON.stringify(product)})">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
}