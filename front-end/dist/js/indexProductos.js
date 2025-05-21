import { cargarProductosDestacados, agregarAlCarrito, formatearPrecioCOP } from './productos.js';

document.addEventListener('DOMContentLoaded', function() {
    mostrarProductosDestacadosPorCategoria();
    renderFeaturedProducts();
});

async function mostrarProductosDestacadosPorCategoria() {
    try {
        const productosDestacados = cargarProductosDestacados();
        const contenedor = document.getElementById('productos-destacados-container');

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
                    ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}
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
                                                <img src="${producto.mainImage}" class="card-img-top" alt="${producto.name}">
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
                                        ${producto.category}
                                    </span>
                                </div>
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${producto.name}</h5>
                                    <p class="card-text">${producto.description}</p>
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
        productosDestacados.forEach(producto => {
            if (producto.additionalImages?.length > 0) {
                new bootstrap.Carousel(document.getElementById(`carousel-${producto.id}`), {
                    interval: 3000
                });
            }
        });

    } catch (error) {
        console.error('Error al mostrar productos destacados:', error);
        document.getElementById('productos-destacados-container').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error al cargar los productos destacados</p>
            </div>
        `;
    }
}

function renderFeaturedProducts() {
    try {
        const productos = cargarProductosDestacados();
        const featuredProducts = productos.filter(p => p.featured);
        const container = document.getElementById('featured-products');

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
                            <img src="${producto.mainImage}" class="d-block w-100" alt="${producto.name}">
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
                    <p>${producto.description}</p>
                    <p class="price">${formatearPrecioCOP(producto.price)}</p>
                    <button class="buy-button" onclick="agregarAlCarrito('${producto.id}')">
                        <i class="fas fa-shopping-cart"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        `).join('');

        // Inicializar todos los carruseles
        featuredProducts.forEach(producto => {
            if (producto.additionalImages?.length > 0) {
                new bootstrap.Carousel(document.getElementById(`featured-carousel-${producto.id}`), {
                    interval: 3000
                });
            }
        });
    } catch (error) {
        console.error('Error al mostrar productos destacados:', error);
        document.getElementById('featured-products').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error al cargar los productos destacados</p>
            </div>
        `;
    }
}