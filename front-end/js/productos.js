// Importaciones y selecciones de elementos del DOM se mantienen igual
import * as adminFunctions from '/front-end/js/admin.js';
// **IMPORTANTE: Asegúrate de que cloudinaryUtils y cloudinaryConfig estén disponibles**
// Si están en un archivo separado, necesitas importarlos:
cloudinaryConfig; // Ajusta la ruta

const iconSelected = document.getElementById("iconSelected");
const hobbieaSelected = document.querySelector(".hobbieaSelected");
const hobbieClicked = document.getElementsByClassName("hobbiea");
const hobbieImageContainer = document.getElementById("hobbieImageContainer");

const categoryIcons = {
    "lectura": "bi-book",
    "deportes": "bi-person-walking",
    "música": "bi bi-music-note",
    "pintura": "bi-palette",
    "videojuegos": "bi-controller",
    "peliculas": "bi-film",
    "crochet": "bi-scissors"
};

// **NUEVO: Definir la URL base de tu backend**
// Reemplaza con la URL pública de tu backend en AWS App Runner
const API_BASE_URL = "https://<subdominio>.us-east-1.awsapprunner.com"; 

// Variable para almacenar los productos cargados y evitar múltiples peticiones
let cachedProducts = [];

// **REFECTORIZADA: renderCategory para obtener productos del backend e integrar Cloudinary**
export default async function renderCategory(category, name) {
    hobbieImageContainer.innerHTML = ""; // Limpiar el contenedor antes de cargar

    let productosFiltrados = [];

    try {
        let endpoint = `${API_BASE_URL}/productos`;
        if (name) {
            // Si se especifica una categoría, usa el endpoint de categoría
            endpoint = `${API_BASE_URL}/productos/categoria/${name}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
            if (response.status === 204) { // No Content, si no hay productos en la categoría
                productosFiltrados = [];
            } else {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
        } else {
            const data = await response.json();
            productosFiltrados = data.map(p => {
                // **IMPORTANTE: ASUMIMOS que el backend envía publicId para las imágenes.**
                // Si tu backend no envía 'mainImagePublicId' o 'additionalImagePublicIds'
                // directamente en la respuesta JSON de Producto, estas propiedades serán undefined.
                // Deberás modificar el backend para que incluya estos publicIds,
                // o tener una lógica en el frontend para asociarlos (ej. por convención de nombre).
                const mainImagePublicId = p.mainImagePublicId || null; // O de p.imagenPublicId si lo llamas así
                const additionalImagePublicIds = p.additionalImagePublicIds || []; // O de p.imagenesAdicionalesPublicIds

                return {
                    id: p.idProducto,
                    name: p.nombreProducto,
                    description: p.descripcion,
                    price: p.precio,
                    category: p.categoria,
                    // **Integración de Cloudinary:** Genera las URLs de imagen usando publicId
                    mainImage: mainImagePublicId ? cloudinaryUtils.getOptimizedUrl(mainImagePublicId, { width: 400, crop: "scale" }) : 'https://via.placeholder.com/300?text=No+Image', // URL optimizada o placeholder
                    additionalImages: additionalImagePublicIds.map(id => cloudinaryUtils.getOptimizedUrl(id, { width: 400, crop: "scale" })),
                    // featured: p.featured // Si tu backend no tiene 'featured', esta línea se ignoraría o daría undefined
                };
            });
            cachedProducts = productosFiltrados; // Cachear los productos cargados
        }
    } catch (error) {
        console.error("Error al cargar productos del backend:", error);
        hobbieImageContainer.innerHTML = `
            <div class="error-loading">
                <p>Ocurrió un error al cargar los productos. Inténtalo de nuevo más tarde.</p>
            </div>
        `;
        return; 
    }

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
                            <img src="${producto.mainImage}" class="d-block w-100" 
                                 alt="${producto.name}">
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
                    <h3>${producto.name}</h3>
                    ${producto.description ? `<p>${producto.description}</p>` : ''}
                    <p class="price">$${(producto.price).toLocaleString()}</p>
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

// Los listeners para hobbieClicked se mantienen igual
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

// DOMContentLoaded se mantiene igual
document.addEventListener("DOMContentLoaded", function () {
    console.log("Página cargada, verificando productos del backend...");
    
    const defaultCategoryLink = Array.from(hobbieClicked).find(link => link.textContent.trim() === "Lectura");

    if (defaultCategoryLink) {
        defaultCategoryLink.classList.add("selected");

        hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
        iconSelected.className = categoryIcons[defaultCategoryLink.dataset.category];
    }

    renderCategory("lectura", "Lectura");
});

// cargarProductosDestacados se mantiene igual
export function cargarProductosDestacados() {
    const destacados = cachedProducts.filter(producto => 
        producto.featured === true || producto.featured === 'on' || producto.featured === 'true'
    );
    return destacados;
}

// agregarAlCarrito se mantiene igual
export function agregarAlCarrito(productoId) {
    const carrito = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
    const producto = cachedProducts.find(p => p.id == productoId);
    
    if (producto) {
        const itemExistente = carrito.find(item => item.productoId == productoId);
        
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                productoId: producto.id,
                nombre: producto.name,
                precio: producto.price,
                imagen: producto.mainImage, // Usar la imagen principal (ahora generada por Cloudinary)
                cantidad: 1
            });
        }
        
        localStorage.setItem('hobbverse_carrito', JSON.stringify(carrito));
        alert('Producto agregado al carrito');
    } else {
        console.error('Producto no encontrado en los productos cacheados:', productoId);
        alert('No se pudo agregar el producto al carrito. Producto no encontrado.');
    }
}

// formatearPrecioCOP se mantiene igual
export function formatearPrecioCOP(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(precio);
}

// cargarTodosLosProductos se mantiene igual
export function cargarTodosLosProductos() {
    return cachedProducts;
}

// (Las funciones `renderizarProductos` y `renderProducts` fueron eliminadas en la refactorización anterior por ser redundantes.)