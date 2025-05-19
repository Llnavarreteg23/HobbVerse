import * as adminFunctions from '/front-end/js/admin.js';

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

export default function renderCategory(category, name) {
    const localProducts = JSON.parse(localStorage.getItem('hobbverse_products')) || [];

    const filteredLocalProducts = localProducts.filter(p => p.category === name);

    hobbieImageContainer.innerHTML = "";

    if (filteredLocalProducts.length > 0) {
        filteredLocalProducts.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.innerHTML = `
                <div id="carousel-${producto.id}" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-indicators">
        <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="0" class="active"></button>
        ${(producto.additionalImages || []).map((_, index) => `
            <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="${index + 1}"></button>
        `).join('')}
    </div>
    <div class="carousel-inner">
        <div class="carousel-item active">
            <img src="${producto.mainImage}" class="d-block w-100" alt="Imagen principal">
        </div>
        ${(producto.additionalImages || []).map(img => `
            <div class="carousel-item">
                <img src="${img}" class="d-block w-100" alt="Imagen adicional">
            </div>
        `).join('')}
        </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Siguiente</span>
            </button>
        </div>

                <div class="product-details">
                    <h3>${producto.nombre || producto.name}</h3>
                    ${producto.autor ? `<p><strong>Autor:</strong> ${producto.autor}</p>` : ""}
                    <p><strong>Precio:</strong> $${(producto.precio || producto.price).toLocaleString()}</p>
                    <button class="buy-button">Comprar</button>
                </div>
            `;
            hobbieImageContainer.appendChild(card);
        });
    } else {
        hobbieImageContainer.innerHTML = "<p>No hay productos disponibles para esta categoría.</p>";
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
    // Intenta obtener productos de 'productos' (usado en indexProductos.js)
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    // Si no hay productos, intenta obtenerlos de 'hobbverse_products' (usado en admin.js)
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
 * Agrega un producto al carrito de compras
 * @param {string} productoId - ID del producto a agregar
 */
export function agregarAlCarrito(productoId) {
    // Obtener el carrito actual o crear uno nuevo
    const carrito = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
    
    // Obtener todos los productos
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    if (!productos.length) {
        productos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
    }
    
    // Buscar el producto por ID
    const producto = productos.find(p => p.id == productoId);
    
    if (producto) {
        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.find(item => item.productoId == productoId);
        
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                productoId: productoId,
                nombre: producto.name,
                precio: producto.price,
                imagen: producto.mainImage,
                cantidad: 1
            });
        }
        
        localStorage.setItem('hobbverse_carrito', JSON.stringify(carrito));
        alert('Producto agregado al carrito');
    } else {
        console.error('Producto no encontrado:', productoId);
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

