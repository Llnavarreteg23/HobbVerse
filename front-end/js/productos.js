import * as adminFunctions from '/front-end/js/admin.js'; // Importa todas las funciones exportadas de admin.js

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

// Función para obtener los productos cargados, si aún no están, espera por ellos.
// Necesitamos un mecanismo para saber cuándo `admin.js` ha terminado de cargar.
// La forma más robusta sería que `admin.js` exportara una promesa o un getter para `products`
// que se resolviera una vez que `loadData` ha terminado.
// Para este ejemplo, asumiremos que `adminFunctions.products` estará eventualmente poblado
// después del 'DOMContentLoaded' en admin.js.

// Una forma más segura de obtener los productos del admin.js:
// Podríamos esperar a que `adminFunctions.products` tenga datos.
// Esto es un poco hacky sin un evento o promesa de `admin.js`,
// pero funcionará si `loadData` en `admin.js` se ejecuta antes de que necesites los datos aquí.
// Si `admin.js` fuera un módulo de un framework, tendrías un estado global o un store.

// Para este escenario, la forma más directa sería que `admin.js` exportara una función asíncrona
// que devolviera los productos ya cargados.
// Pero dado que pediste "sin modificar nada más del código" (de productos.js),
// asumiré que el `products` de `adminFunctions` será accesible cuando se necesite.

// Modificamos la función `renderCategory` para que sea `async` y cargue los productos del backend
export default async function renderCategory(category, name) {
    // Si adminFunctions.products aún no está cargado (array vacío), espera un poco.
    // Esto es una solución temporal. Idealmente, admin.js debería exportar una promesa
    // que se resuelva cuando los productos estén listos.
    let allProducts = adminFunctions.products;
    while (!allProducts || allProducts.length === 0) {
        console.log("Esperando que admin.js cargue los productos...");
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms
        allProducts = adminFunctions.products;
    }

    // Filtrar por categoría si se especifica
    const productosFiltrados = name ?
        allProducts.filter(p => p.categoria?.toLowerCase() === name.toLowerCase()) :
        allProducts; // Usa product.categoria, no product.category, según tu admin.js

    hobbieImageContainer.innerHTML = "";

    if (productosFiltrados.length > 0) {
        productosFiltrados.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";

            // Las propiedades mainImage y additionalImages ya están en el producto
            // gracias a que admin.js las adjuntó desde localStorage.
            const mainImageUrl = producto.mainImage || 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen';
            const additionalImages = producto.additionalImages || [];

            let carouselIndicators = `
                <button type="button" data-bs-target="#carousel-${producto.idProducto}"
                        data-bs-slide-to="0" class="active"></button>
            `;
            additionalImages.forEach((_, index) => {
                carouselIndicators += `
                    <button type="button" data-bs-target="#carousel-${producto.idProducto}"
                            data-bs-slide-to="${index + 1}"></button>
                `;
            });

            let carouselItems = `
                <div class="carousel-item active">
                    <img src="${mainImageUrl}" class="d-block w-100"
                            alt="${producto.nombreProducto}" style="object-fit: cover; height: 200px;">
                </div>
            `;
            additionalImages.forEach(img => {
                carouselItems += `
                    <div class="carousel-item">
                        <img src="${img}" class="d-block w-100" alt="Imagen adicional" style="object-fit: cover; height: 200px;">
                    </div>
                `;
            });

            const needsCarouselControls = (additionalImages.length > 0 || mainImageUrl !== 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen');

            card.innerHTML = `
                <div id="carousel-${producto.idProducto}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        ${carouselIndicators}
                    </div>
                    <div class="carousel-inner">
                        ${carouselItems}
                    </div>
                    ${needsCarouselControls ? `
                        <button class="carousel-control-prev" type="button"
                                data-bs-target="#carousel-${producto.idProducto}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Anterior</span>
                        </button>
                        <button class="carousel-control-next" type="button"
                                data-bs-target="#carousel-${producto.idProducto}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    ` : ''}
                </div>
                <div class="product-details">
                    <h3>${producto.nombreProducto}</h3>
                    ${producto.descripcion ? `<p>${producto.descripcion}</p>` : ''}
                    <p class="price">${adminFunctions.formatter.format(producto.precio)}</p>
                    ${producto.featured ? '<span class="badge bg-warning">Destacado</span>' : ''}
                    <button class="buy-button" onclick="agregarAlCarrito('${producto.idProducto}')">
                        Agregar al carrito
                    </button>
                </div>
            `;
            hobbieImageContainer.appendChild(card);
        });
    } else {
        hobbieImageContainer.innerHTML = `
            <div class="no-products">
                <p>No hay productos disponibles en esta categoría.</p>
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
    link.addEventListener("click", async function(event) { // Make the event listener async
        event.preventDefault();

        Array.from(hobbieClicked).forEach(item => item.classList.remove("selected"));

        this.classList.add("selected");

        const category = this.dataset.category;
        const name = this.textContent.trim();

        hobbieaSelected.textContent = name;

        iconSelected.className = categoryIcons[category];

        await renderCategory(category, name); // Await the async function
    });
});

document.addEventListener("DOMContentLoaded", async function () { // Make DOMContentLoaded listener async
    console.log("Página cargada, verificando productos de la base de datos...");

    const defaultCategoryLink = Array.from(hobbieClicked).find(link => link.textContent.trim() === "Lectura");

    if (defaultCategoryLink) {
        defaultCategoryLink.classList.add("selected");

        hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
        iconSelected.className = categoryIcons[defaultCategoryLink.dataset.category];
    }

    await renderCategory("lectura", "Lectura"); // Await the initial render
});

/**
 * Carga los productos destacados desde la base de datos (vía adminFunctions.products)
 * @returns {Array} Array de productos destacados
 */
export function cargarProductosDestacados() {
    let productsFromAdmin = adminFunctions.products || []; // Obtiene los productos de admin.js

    // Filtra solo los productos destacados
    const destacados = productsFromAdmin.filter(producto =>
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

    // Obtener todos los productos de adminFunctions.products
    let allProducts = adminFunctions.products || [];

    // Buscar el producto por ID (ahora usa idProducto)
    const producto = allProducts.find(p => p.idProducto == productoId);

    if (producto) {
        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.find(item => item.productoId == productoId);

        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({
                productoId: productoId,
                nombre: producto.nombreProducto, // Usa nombreProducto
                precio: producto.precio,        // Usa precio
                imagen: producto.mainImage || 'https://via.placeholder.com/150', // Usa mainImage
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
    // Usa el formatter exportado de adminFunctions
    return adminFunctions.formatter.format(precio);
}

/**
 * Carga todos los productos desde la base de datos (vía adminFunctions.products)
 * @returns {Array} Array de todos los productos
 */
export function cargarTodosLosProductos() {
    return adminFunctions.products || []; // Obtiene los productos de admin.js
}

/**
 * Renderiza los productos en el contenedor especificado
 * @param {string} categoria - Categoría para filtrar los productos (opcional)
 */
export async function renderizarProductos(categoria = null) { // Make this async too
    let productsToRender = adminFunctions.products;
    while (!productsToRender || productsToRender.length === 0) {
        console.log("Esperando que admin.js cargue los productos para renderizarProductos...");
        await new Promise(resolve => setTimeout(resolve, 100)); // Espera 100ms
        productsToRender = adminFunctions.products;
    }

    const productosFiltrados = categoria ?
        productsToRender.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase()) :
        productsToRender;

    const contenedor = document.getElementById('hobbieImageContainer');

    if (!productosFiltrados.length) {
        contenedor.innerHTML = '<p class="text-center">No hay productos disponibles</p>';
        return;
    }

    contenedor.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card ${producto.featured ? 'featured' : ''}">
            <div class="position-relative">
                <img src="${producto.mainImage || 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen'}" alt="${producto.nombreProducto}" style="object-fit: cover; height: 200px;">
                ${producto.featured ?
                    '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Destacado</span>'
                    : ''}
            </div>
            <div class="product-details">
                <h3>${producto.nombreProducto}</h3>
                <p>${producto.descripcion || ''}</p>
                <p class="price">${adminFunctions.formatter.format(producto.precio)}</p>
                <button class="buy-button" onclick="agregarAlCarrito('${producto.idProducto}')">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
}

// Esta función renderProducts parece ser un duplicado o una versión más antigua.
// Si no la estás usando en ningún otro lugar, puedes considerar eliminarla.
// Si la usas, también deberías adaptarla para usar adminFunctions.products y el formato correcto.
function renderProducts(products) {
    const container = document.getElementById('hobbieImageContainer');
    container.innerHTML = products.map(product => `
        <div class="producto-card">
            <img src="${product.mainImage || product.imagen}" alt="${product.name || product.nombre}">
            <div class="product-details">
                <h3>${product.name || product.nombre}</h3>
                <p>${product.description || ''}</p>
                <p class="price">${adminFunctions.formatter.format(product.price || product.precio)}</p>
                <button class="buy-button" onclick="window.floatingCart.addToCart(${JSON.stringify(product)})">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
}