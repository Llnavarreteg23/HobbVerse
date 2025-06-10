
import * as adminFunctions from './admin.js'; // Asegúrate que la ruta sea correcta desde productos.js a admin.js

const iconSelected = document.getElementById("iconSelected");
const hobbieaSelected = document.querySelector(".hobbieaSelected");
const hobbieClicked = document.getElementsByClassName("hobbiea");
const hobbieImageContainer = document.getElementById("hobbieImageContainer");

// Nueva Configuración de la API del Backend
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

/**
/**
 * Función asíncrona para obtener productos filtrado por categoría.
 * @param {string} categoriaNombre; 
 * @returns {Array} 
 */
async function productosCategoria(categoriaNombre) {
    if (!categoriaNombre) {
        console.warn("No se proporcionó un nombre de categoría. No se realizará la búsqueda.");
        return [];
    }

    // *** CAMBIO AQUÍ para usar el formato de @PathVariable ***
    // La URL debe ser directamente /productos/categoria/{categoriaNombre}
    const url = `${API_PRODUCT_BASE_URL}/categoria/${encodeURIComponent(categoriaNombre)}`; 
    // encodeURIComponent es importante para manejar nombres de categoría con espacios o caracteres especiales

    try {
        const response = await fetch(url); // Ya no es necesario .toString() si construyes la string directamente
        
        if (!response.ok) {
            if (response.status === 204) {
                console.log(`No hay productos para la categoría: ${categoriaNombre}`);
                return []; 
            }
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener productos de la categoría '${categoriaNombre}':`, error);
        return []; 
    }
}

/**
 * Obtener productos de una categoría específica y renderizarlos.
 * @param {string} categoryData - El valor del atributo data-category del elemento clickeado
 * @param {string} categoriaNombre - El nombre de la categoría 
 */
export default async function renderCategory(categoryData, categoriaNombre) {
    hobbieImageContainer.innerHTML = ""; 

    // 1. Obtiene los productos filtrados por categoría desde el backend.
    let productosFiltrados = await productosCategoria(categoriaNombre);

    // 2. Para cada producto, intenta cargar sus URLs de imagen desde localStorage.
    productosFiltrados = productosFiltrados.map(producto => {
        // Usa la función importada desde adminFunctions
        const localImages = adminFunctions.getProductImagesFromLocalStorage(producto.idProducto); // Asumo que el ID del producto es `idProducto`

        return {
            ...producto,
            mainImage: localImages.main,
            additionalImages: localImages.additional
        };
    });

    if (productosFiltrados.length > 0) {
        productosFiltrados.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            
            // Usa las propiedades `mainImage` y `additionalImages` que ahora
            // contendrán las URLs de localStorage si existen, o serán vacías/undefined.
            const mainImage = producto.mainImage || 'https://via.placeholder.com/300x200?text=Sin+Imagen'; 
            const additionalImages = producto.additionalImages || [];

            // Determina si se necesitan los controles del carrusel
            const needsCarouselControls = (additionalImages.length > 0 || mainImage !== 'https://via.placeholder.com/300x200?text=Sin+Imagen');

            card.innerHTML = `
                <div id="carousel-${producto.idProducto}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#carousel-${producto.idProducto}" 
                                data-bs-slide-to="0" class="active"></button>
                        ${additionalImages.map((_, index) => `
                            <button type="button" data-bs-target="#carousel-${producto.idProducto}" 
                                    data-bs-slide-to="${index + 1}"></button>
                        `).join('')}
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="${mainImage}" class="d-block w-100" 
                                alt="${producto.nombreProducto}">
                        </div>
                        ${additionalImages.map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional">
                            </div>
                        `).join('')}
                    </div>
                    ${needsCarouselControls ? `
                        <button class="carousel-control-prev" type="button" 
                                data-bs-target="#carousel-${producto.idProducto}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                            <span class="visually-hidden">Anterior</span>
                        </button>
                        <button class="carousel-control-next" type="button" 
                                data-bs-target="#carousel-${producto.idProducto}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    ` : ''}
                </div>
                <div class="product-details">
                    <h3>${producto.nombreProducto}</h3>
                    ${producto.descripcion ? `<p>${producto.descripcion}</p>` : ''}
                    <p class="price">${formatearPrecioCOP(producto.precio)}</p>
                    ${producto.featured ? '<span class="badge bg-warning">Destacado</span>' : ''} <button class="buy-button" onclick="agregarAlCarrito('${producto.idProducto}')"> Agregar al carrito
                    </button>
                </div>
            `;
            hobbieImageContainer.appendChild(card);

            // Inicializa el carrusel de Bootstrap para cada tarjeta
            const carouselElement = card.querySelector(`#carousel-${producto.idProducto}`);
            if (carouselElement) {
                new bootstrap.Carousel(carouselElement);
            }
        });
    } else {
        hobbieImageContainer.innerHTML = `
            <div class="no-products">
                <p>No hay productos disponibles en esta categoría.</p>
            </div>
        `;
    }

    // Actualiza el ícono y título de la categoría seleccionada en la UI
    if (categoryData && categoriaNombre) {
        iconSelected.className = `bi ${categoryIcons[categoryData.toLowerCase()] || 'bi-tag'}`;
        hobbieaSelected.textContent = categoriaNombre;
    }
}

// Event Listeners para los clics en las categorías (hobbies)
Array.from(hobbieClicked).forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        // Remueve la clase 'selected' de todos los enlaces y la añade al clickeado
        Array.from(hobbieClicked).forEach(item => item.classList.remove("selected"));
        this.classList.add("selected");

        const category = this.dataset.category; // ej. "lectura"
        const name = this.textContent.trim(); // ej. "Lectura"

        // Actualiza el texto y el ícono de la categoría seleccionada
        hobbieaSelected.textContent = name;
        iconSelected.className = categoryIcons[category];

        renderCategory(category, name); // Llama a la función actualizada con la nueva categoría
    });
});

// Cuando la página se carga, selecciona "Lectura" por defecto y renderiza
document.addEventListener("DOMContentLoaded", function () {
    console.log("Página cargada. Obteniendo productos del backend...");
    
    const defaultCategoryLink = Array.from(hobbieClicked).find(link => link.textContent.trim() === "Lectura");

    if (defaultCategoryLink) {
        defaultCategoryLink.classList.add("selected"); // Marca como seleccionado

        hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
        iconSelected.className = categoryIcons[defaultCategoryLink.dataset.category];
    }

    renderCategory("lectura", "Lectura"); // Carga los productos de "Lectura" al iniciar
});

/**
 * Agrega un producto al carrito de compras.
 * Ahora obtiene los detalles del producto desde el backend por su ID.
 * @param {string} productoId - ID del producto a agregar.
 */
export async function agregarAlCarrito(productoId) {
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
            const localImages = adminFunctions.getProductImagesFromLocalStorage(producto.idProducto); // Usa la función importada

            const itemExistente = carrito.find(item => item.productoId == productoId);
            
            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({
                    productoId: producto.idProducto, // Asegúrate de usar idProducto
                    nombre: producto.nombreProducto, 
                    precio: producto.precio,         
                    imagen: localImages.main || 'https://via.placeholder.com/50x50?text=Img', // Usa la imagen principal de localStorage
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
 * Formatea un precio como moneda colombiana (COP).
 * @param {number} precio - El precio a formatear.
 * @returns {string} El precio formateado.
 */
export function formatearPrecioCOP(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio);
}