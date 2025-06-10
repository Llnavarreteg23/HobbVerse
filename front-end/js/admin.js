const defaultCategories = [
    { id: 1, name: "Lectura" },
    { id: 2, name: "Deportes" },
    { id: 3, name: "Música" },
    { id: 4, name: "Pintura" },
    { id: 5, name: "Videojuegos" },
    { id: 6, name: "Peliculas" },
    { id: 7, name: "Crochet" }
];

const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// Configuración de la API del Backend
const API_BASE_URL = "https://9s68ixqgw5.us-east-1.awsapprunner.com";
const API_PRODUCT_BASE_URL = `${API_BASE_URL}/productos`;

// Variable global que contendrá el estado de los productos
// 'products' contendrá la información inicial del backend
// y luego se modificará con el estado de favoritos en el frontend.
let products = [];
let categories = []; // Esta variable ahora siempre será llenada con defaultCategories
let editingCategoryId = null;
let editingProductId = null;

// Estas variables mantendrán las URLs de las imágenes subidas a Cloudinary
// SOLO PARA LA VISTA PREVIA TEMPORAL EN EL FORMULARIO EN EL FRONTEND.
// NO se enviarán al backend con el producto.
let currentMainImageUrl = '';
let currentAdditionalImageUrls = [];

// Nuevo objeto para mapear IDs de producto a URLs de imagen,
// PERO SOLO DENTRO DE LA SESIÓN ACTUAL DEL NAVEGADOR.
// Esto permite que las imágenes subidas persistan visualmente mientras
// la página no se recargue completamente o el navegador no se cierre.
let productImagesCache = {};


document.addEventListener('DOMContentLoaded', function() {
    loadData(); // Carga inicial de datos, incluyendo los del backend
    setupEventListeners();
    initImageUpload();
    setupFilters();
});

function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    document.getElementById('productList').addEventListener('click', function(event) {
        if (event.target.closest('.toggle-favorite-btn')) {
            const productId = event.target.closest('.toggle-favorite-btn').dataset.productId;
            toggleProductFavorite(productId);
        }
    });
}


// Funciones de Utilidad de la API

async function apiFetch(baseUrl, endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`Realizando llamada a la API: ${url} con método: ${options.method || 'GET'}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        });

        if (!response.ok) {
            let errorMsg = `Error de API: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch (e) {
                console.warn('No se pudo analizar la respuesta de error como JSON:', e);
            }
            throw new Error(errorMsg);
        }

        if (response.status === 204) {
            return null;
        }
        return response.json();
    } catch (networkError) {
        console.error('Error de red o CORS al llamar a la API:', networkError);
        throw new Error(`Error de conexión con el servidor: ${networkError.message}`);
    }
}

async function loadData() {
    try {
        // Se cargan los productos desde el backend
        products = await apiFetch(API_PRODUCT_BASE_URL, '');
        console.log('Todos los productos cargados desde el backend:', products);

        // Las categorías se cargan SIEMPRE desde defaultCategories ---
        categories = [...defaultCategories]; // Asigna una copia de las categorías predefinidas
        console.log('Categorías cargadas desde el frontend (por defecto):', categories);

        // Al cargar datos, reiniciamos el caché de imágenes
        productImagesCache = {};

    } catch (error) {
        console.error('Error general al cargar productos desde el backend:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`No se pudieron cargar los productos del backend: ${error.message}`, 'warning');
        } else {
            alert(`No se pudieron cargar los productos del backend: ${error.message}`);
        }
        products = []; // Limpia los productos si hay un error de carga

    }
    updateUI();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
        nombreProducto: formData.get('name'),
        cantidad: parseInt(formData.get('stock')),
        precio: parseFloat(formData.get('price')),
        categoria: formData.get('category'),
        descripcion: formData.get('description'),
        // NO se envían las URLs de imágenes al backend.
        // mainImageUrl: currentMainImageUrl,
        // additionalImageUrls: currentAdditionalImageUrls,
        featured: document.getElementById('productFeatured').checked // Asegurarse de enviar el estado de destacado
    };

    if (!productData.nombreProducto || !productData.cantidad || !productData.precio || !productData.categoria || !productData.descripcion) {
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta('Todos los campos obligatorios deben ser llenados.', 'warning');
        } else {
            alert('Todos los campos obligatorios deben ser llenados.');
        }
        return;
    }

    try {
        let message = '';
        let createdOrUpdatedProduct; // Para capturar el producto si el backend lo devuelve

        if (editingProductId) {
            createdOrUpdatedProduct = await apiFetch(API_PRODUCT_BASE_URL, `/${editingProductId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            message = 'Producto actualizado exitosamente';
        } else {
            createdOrUpdatedProduct = await apiFetch(API_PRODUCT_BASE_URL, '', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            message = 'Producto agregado exitosamente';
        }

        // Si se creó/actualizó un producto y tenemos sus URLs de imagen en el frontend,
        // las almacenamos en el caché local.
        if (createdOrUpdatedProduct && createdOrUpdatedProduct.idProducto) {
            productImagesCache[createdOrUpdatedProduct.idProducto] = {
                main: currentMainImageUrl,
                additional: [...currentAdditionalImageUrls]
            };
        }

        await loadData(); // Recarga los datos del backend, que no incluirán las URLs de imagen
        e.target.reset(); // Limpia el formulario

        editingProductId = null;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Agregar Producto';

        // --- Manejo del checkbox
        const featuredCheckbox = document.getElementById('productFeatured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = false; // Asegura que el checkbox se desmarque después de enviar
        }

        // Limpia la vista previa de imágenes y las URLs de Cloudinary temporales
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imagesPreview').innerHTML = '';
        currentMainImageUrl = ''; // Limpiar URLs temporales de Cloudinary
        currentAdditionalImageUrls = []; // Limpiar URLs temporales de Cloudinary
        // No es necesario el input hidden 'uploadedAdditionalImages' si no se envía al backend.

        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(message, 'success');
        } else {
            alert(message);
        }

    } catch (error) {
        console.error('Error al guardar el producto:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Error al guardar el producto: ${error.message}`, 'danger');
        } else {
            alert(`Error al guardar el producto: ${error.message}`);
        }
    }
}

function updateUI() {
    updateProductList();
    updateCategorySelect();
    updateProductCount(products.length);
}

async function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;

    let productsToDisplay = [];

    try {
        if (searchTerm) {
            const response = await apiFetch(API_PRODUCT_BASE_URL, `/nombre/coincidencias/${encodeURIComponent(searchTerm)}`);

            if (response && Array.isArray(response)) {
                productsToDisplay = response.filter(product => {
                    const categoryMatch = !categoryFilter || product.categoria?.toLowerCase() === categoryFilter.toLowerCase();
                    return categoryMatch;
                });
            } else {
                productsToDisplay = [];
            }
        } else {
            // Cuando no hay búsqueda, se filtra sobre 'products' cargados desde el backend
            productsToDisplay = products.filter(product => {
                const categoryMatch = !categoryFilter || product.categoria?.toLowerCase() === categoryFilter.toLowerCase();
                return categoryMatch;
            });
        }
    } catch (error) {
        console.error('Error al buscar o filtrar productos:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Error al buscar/filtrar: ${error.message}`, 'danger');
        } else {
            alert(`Error al buscar/filtrar: ${error.message}`);
        }
        productsToDisplay = [];
    }

    updateProductList(productsToDisplay);
    updateProductCount(productsToDisplay.length);
}

function updateProductList(productosToDisplay = null) {
    const productList = document.getElementById('productList');
    if (!productList) return;

    const currentProducts = productosToDisplay || products;

    if (currentProducts.length === 0) {
        productList.innerHTML = '<div class="col-12 text-center text-muted mt-5">No se encontraron productos.</div>';
        updateProductCount(0);
        return;
    }

    productList.innerHTML = currentProducts.map(product => {
        // OBTENER IMÁGENES DEL CACHÉ LOCAL DEL NAVEGADOR
        const cachedImages = productImagesCache[product.idProducto] || { main: '', additional: [] };
        const imageUrlToDisplay = cachedImages.main || 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen';
        const additionalImages = cachedImages.additional || [];

        let carouselIndicators = '';
        let carouselItems = '';

        const allImages = [imageUrlToDisplay, ...additionalImages].filter(url => url);

        if (allImages.length > 0) {
            carouselIndicators = allImages.map((_, index) => `
                <button type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>
            `).join('');

            carouselItems = allImages.map((url, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${url}" class="d-block w-100" alt="${product.nombreProducto} ${index === 0 ? 'principal' : 'adicional ' + index}" style="height: 200px; object-fit: cover;">
                </div>
            `).join('');
        } else {
            // Si no hay imágenes (ni siquiera el placeholder si se filtró por URL vacía), mostrar solo el placeholder
            carouselIndicators = `
                <button type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
            `;
            carouselItems = `
                <div class="carousel-item active">
                    <img src="https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen" class="d-block w-100" alt="${product.nombreProducto}" style="height: 200px; object-fit: cover;">
                </div>
            `;
        }

        return `
            <div class="col">
                <div class="card h-100 ${product.featured ? 'border-warning shadow' : ''}">
                    <div id="carousel-${product.idProducto}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-indicators">
                            ${carouselIndicators}
                        </div>
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.nombreProducto}</h5>
                        <p class="card-text">${product.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${formatter.format(product.precio)}</p>
                        <p class="card-text"><strong>Categoría: </strong>${product.categoria}</p>
                        <p class="card-text"><strong>Stock: </strong>${product.cantidad}</p>
                        <div class="btn-group w-100">
                            <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${product.idProducto}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.idProducto}')">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button class="btn btn-sm ${product.featured ? 'btn-warning' : 'btn-outline-warning'} toggle-favorite-btn" data-product-id="${product.idProducto}">
                                <i class="bi bi-star${product.featured ? '-fill' : ''}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        const totalProducts = products.length;
        if (count === totalProducts) {
            countElement.textContent = `Mostrando ${count} productos`;
        } else {
            countElement.textContent = `Mostrando ${count} de ${totalProducts} productos`;
        }
    }
}

function updateCategorySelect() {
    const categorySelects = document.querySelectorAll('select[name="category"], #categoryFilter');
    const options = `
        ${document.querySelector('#categoryFilter') ? '<option value="">Todas las categorías</option>' : ''}
        ${categories.map(category =>
            `<option value="${category.name}">${category.name}</option>`
        ).join('')}
    `;

    categorySelects.forEach(select => {
        select.innerHTML = options;
    });
}

async function editProduct(productId) {
    try {
        const product = await apiFetch(API_PRODUCT_BASE_URL, `/${productId}`);
        console.log('Producto cargado para edición:', product);

        const form = document.getElementById('productForm');
        if (!form) {
            console.error('Formulario de producto no encontrado');
            return;
        }

        form.elements['name'].value = product.nombreProducto || '';
        form.elements['category'].value = product.categoria || '';
        form.elements['description'].value = product.descripcion || '';
        form.elements['price'].value = product.precio || 0;
        form.elements['stock'].value = product.cantidad || 0;

        const featuredCheckbox = document.getElementById('productFeatured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = product.featured || false;
        }

        // Cargar las URLs de imágenes DEL CACHÉ LOCAL para edición, si existen
        const cachedImages = productImagesCache[productId] || { main: '', additional: [] };
        currentMainImageUrl = cachedImages.main;
        currentAdditionalImageUrls = [...cachedImages.additional];

        const imagePreview = document.getElementById('imagePreview');
        const imagesPreviewContainer = document.getElementById('imagesPreview');

        // Mostrar la imagen principal si existe en el caché
        if (imagePreview) {
            imagePreview.innerHTML = currentMainImageUrl ? `
                <div class="position-relative">
                    <img src="${currentMainImageUrl}" class="img-thumbnail" style="max-height: 200px">
                </div>
            ` : '';
        }

        // Mostrar las imágenes adicionales si existen en el caché
        updateAdditionalImagesPreview(); // Llama a la función para renderizar las imágenes adicionales desde currentAdditionalImageUrls

        editingProductId = productId;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Actualizar Producto';

        form.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error al editar producto:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Error al cargar el producto para edición: ${error.message}`, 'danger');
        } else {
            alert(`Error al cargar el producto para edición: ${error.message}`);
        }
    }
}

async function deleteProduct(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await apiFetch(API_PRODUCT_BASE_URL, `/${productId}`, {
                method: 'DELETE'
            });
            // Si el producto se elimina, también eliminarlo del caché de imágenes
            delete productImagesCache[productId];
            await loadData();
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta('Producto eliminado exitosamente', 'success');
            } else {
                alert('Producto eliminado exitosamente');
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            let errorMessage = error.message;

            if (errorMessage.includes("Cannot delete or update a parent row: a foreign key constraint fails") &&
                errorMessage.includes("hobbverse") && errorMessage.includes("pedido") &&
                errorMessage.includes("id_producto")) {
                errorMessage = "No se puede borrar el producto, ya está entrelazado con algunos pedidos.";
            }

            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta(`Error al eliminar el producto: ${errorMessage}`, 'danger');
            } else {
                alert(`Error al eliminar el producto: ${errorMessage}`);
            }
        }
    }
}

async function toggleProductFavorite(productId) {
    try {
        const productIndex = products.findIndex(p => p.idProducto === productId);
        if (productIndex === -1) {
            console.error('Producto no encontrado para marcar como favorito:', productId);
            return;
        }

        const product = products[productIndex];
        const newFeaturedState = !product.featured;
        // Se actualiza el estado local y se envía la actualización al backend
        const updatedProduct = { ...product, featured: newFeaturedState };

        // Asegúrate de que el backend solo reciba el campo 'featured' si no quieres enviar otros datos
        // o si el endpoint PUT está diseñado para actualizar solo los campos provistos.
        // Aquí se envía todo el objeto actualizado, pero si el backend no lo procesa,
        // esto no causará un error siempre que los demás campos sean válidos.
        await apiFetch(API_PRODUCT_BASE_URL, `/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedProduct)
        });

        // Solo si la llamada al API fue exitosa, actualizamos el estado local
        product.featured = newFeaturedState;
        updateProductList(); // Re-renderizar la lista para reflejar el cambio visual

        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Producto ${newFeaturedState ? 'marcado como favorito' : 'desmarcado de favoritos'}`, 'success');
        } else {
            alert(`Producto ${newFeaturedState ? 'marcado como favorito' : 'desmarcado de favoritos'}`);
        }

    } catch (error) {
        console.error('Error al cambiar estado de favorito:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Error al actualizar favorito: ${error.message}`, 'danger');
        } else {
            alert(`Error al actualizar favorito: ${error.message}`);
        }
    }
}

const cloudinaryConfig = {
    cloudName: 'diljcypxv',
    uploadPreset: 'hobbverse_unsigned'
};

function initImageUpload() {
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const uploadMultipleBtn = document.getElementById('uploadMultipleBtn');
    const imagePreview = document.getElementById('imagePreview');
    const imagesPreview = document.getElementById('imagesPreview');
    // const uploadedAdditionalImagesInput = document.getElementById('uploadedAdditionalImages'); // No es necesario si no se envía al backend

    if (!uploadImageBtn || !uploadMultipleBtn) {
        console.warn('Botones de carga de imagen de Cloudinary no encontrados. La funcionalidad de carga de imágenes no estará disponible.');
        return;
    }

    const uploadWidget = cloudinary.createUploadWidget({
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        multiple: true,
        maxFiles: 5, // Puedes ajustar este límite según tus necesidades
        clientAllowedFormats: ["png", "gif", "jpeg", "jpg"],
        thumbnailTransformation: { width: 100, height: 100, crop: "fill" }
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;

            if (uploadWidget.lastButtonClicked === 'main') {
                currentMainImageUrl = imageUrl;
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <div class="position-relative">
                            <img src="${imageUrl}" class="img-thumbnail" style="max-height: 200px">
                        </div>
                    `;
                }
            } else if (uploadWidget.lastButtonClicked === 'additional') {
                currentAdditionalImageUrls.push(imageUrl);
                updateAdditionalImagesPreview();
            }
        } else if (error) {
            console.error('Error de carga de imagen de Cloudinary:', error);
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta(`Error al subir imagen: ${error.message}`, 'danger');
            } else {
                alert(`Error al subir imagen: ${error.message}`);
            }
        }
    });

    uploadImageBtn.addEventListener('click', () => {
        uploadWidget.update({ multiple: false }); // Para asegurar que se carga una sola imagen principal
        uploadWidget.lastButtonClicked = 'main';
        uploadWidget.open();
    });

    uploadMultipleBtn.addEventListener('click', () => {
        uploadWidget.update({ multiple: true, maxFiles: 5 }); // Para permitir múltiples imágenes adicionales
        uploadWidget.lastButtonClicked = 'additional';
        uploadWidget.open();
    });

    if (imagesPreview) {
        window.updateAdditionalImagesPreview = () => {
            imagesPreview.innerHTML = currentAdditionalImageUrls.map((url, index) => `
                <div class="d-inline-block position-relative me-2 mb-2">
                    <img src="${url}" class="img-thumbnail" style="height: 150px; object-fit: cover;">
                    <button type="button" class="btn custom-elimnar-img position-absolute top-0 end-0"
                            onclick="removeAdditionalImageFromPreview(${index})">
                        <i class="bi bi-x custom-x-icon"></i>
                    </button>
                </div>
            `).join('');
        };
    } else {
        window.updateAdditionalImagesPreview = () => { /* No-op si no existe el contenedor */ };
    }

    window.removeAdditionalImageFromPreview = (index) => {
        currentAdditionalImageUrls.splice(index, 1);
        updateAdditionalImagesPreview();
    };
}

function setupFilters() {
    const searchInput = document.getElementById('searchProducts');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.removeEventListener('input', filterProducts);
        searchInput.addEventListener('input', filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.removeEventListener('change', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);
    }
}