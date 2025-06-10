
// Importaciones de admin.js
import { API_BASE_URL, apiFetch, formatter, cloudinaryConfig, getCloudinaryImageUrl } from './admin.js'; 
// Ajusta la ruta si admin.js no está en el mismo directorio que productos.js.
// Por ejemplo, si productos.js está en /front-end/js/ y admin.js también, entonces './admin.js' es correcto.

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

// Variable para almacenar los productos cargados y evitar múltiples peticiones
let cachedProducts = [];

// **REFECTORIZADA: renderCategory para obtener productos del backend e integrar Cloudinary**
export default async function renderCategory(category, name) {
    hobbieImageContainer.innerHTML = ""; // Limpiar el contenedor antes de cargar

    let productosFiltrados = [];

    try {
        let endpoint = `/productos`; // Endpoint relativo a API_PRODUCT_BASE_URL
        if (name) {
            endpoint = `/productos/categoria/${encodeURIComponent(name)}`;
        }
        
        // Usar la función apiFetch importada de admin.js
        // Pasamos API_BASE_URL directamente a apiFetch ya que el endpoint ya incluye /productos
        // NOTA: Si API_PRODUCT_BASE_URL ya es 'https://9s68ixqgw5.us-east-1.awsapprunner.com/productos',
        // entonces el endpoint debe ser solo lo que viene DESPUÉS de /productos.
        // EJ: si API_PRODUCT_BASE_URL = '.../productos'
        // y quieres '.../productos/categoria/X', el endpoint para apiFetch sería '/categoria/X'.
        // Tu API_PRODUCT_BASE_URL ya está bien definida como `BASE_URL/productos`.
        // Así que la llamada debe ser apiFetch(API_PRODUCT_BASE_URL, `/${endpoint_relativo}`);
        const data = await apiFetch(API_BASE_URL, endpoint); // Usar API_BASE_URL para que apiFetch construya bien la URL

        if (!data || data.length === 0) {
            productosFiltrados = [];
        } else {
            productosFiltrados = data.map(p => {
                // Asumimos que el backend envía 'mainImagePublicId' y 'additionalImagePublicIds'
                const mainImagePublicId = p.mainImagePublicId || null;
                const additionalImagePublicIds = p.additionalImagePublicIds || [];

                return {
                    id: p.idProducto,
                    name: p.nombreProducto,
                    description: p.descripcion,
                    price: p.precio,
                    category: p.categoria,
                    // **Integración de Cloudinary:** Genera las URLs de imagen usando publicId
                    // Usar la función importada de admin.js
                    mainImage: mainImagePublicId ? getCloudinaryImageUrl(mainImagePublicId, { width: 300, height: 200, crop: "fill" }) : 'https://via.placeholder.com/300x200?text=No+Image',
                    additionalImages: additionalImagePublicIds.map(id => getCloudinaryImageUrl(id, { width: 300, height: 200, crop: "fill" })),
                    featured: p.featured || false // Asegurarse de que featured esté presente
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
                                 alt="${producto.name}" style="height: 200px; object-fit: cover;">
                        </div>
                        ${(producto.additionalImages || []).map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional" style="height: 200px; object-fit: cover;">
                            </div>
                        `).join('')}
                    </div>
                    ${(producto.additionalImages || []).length > 0 || producto.mainImage !== 'https://via.placeholder.com/300x200?text=No+Image' ? `
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
                    <p class="price">${formatter.format(producto.price)}</p> 
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
    // Los productos destacados se cargan ahora con 'featured' del backend
    return cachedProducts.filter(producto => 
        producto.featured === true
    );
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
                imagen: producto.mainImage, // Usar la imagen principal 
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