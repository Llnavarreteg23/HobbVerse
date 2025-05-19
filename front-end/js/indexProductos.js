import { cargarProductosDestacados, agregarAlCarrito, formatearPrecioCOP } from './productos.js';

document.addEventListener('DOMContentLoaded', function() {
    mostrarProductosDestacadosPorCategoria();
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
                                    <img src="${producto.mainImage}" class="card-img-top" alt="${producto.name}">
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
                                            Agregar al carrito
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

    } catch (error) {
        console.error('Error al mostrar productos destacados:', error);
        document.getElementById('productos-destacados-container').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error al cargar los productos destacados</p>
            </div>
        `;
    }
}