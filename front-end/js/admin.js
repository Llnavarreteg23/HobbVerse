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
// Serán utilizadas para guardarlas en localStorage.
let currentMainImageUrl = '';
let currentAdditionalImageUrls = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData(); // Carga inicial de datos, incluyendo los del backend y del localStorage
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
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return null;
    } catch (networkError) {
        console.error('Error de red o CORS al llamar a la API:', networkError);
        throw new Error(`Error de conexión con el servidor: ${networkError.message}`);
    }
}

// --- NUEVAS FUNCIONES PARA MANEJAR IMÁGENES EN LOCAL STORAGE ---

function saveProductImagesToLocalStorage(productId, mainImageUrl, additionalImageUrls) {
    if (!productId) {
        console.warn('No se puede guardar la imagen en localStorage sin un ID de producto.');
        return;
    }
    const imageData = {
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls
    };
    try {
        localStorage.setItem(`productImages_${productId}`, JSON.stringify(imageData));
        console.log(`Imágenes guardadas en localStorage para producto ${productId}`);
    } catch (e) {
        console.error('Error al guardar imágenes en localStorage:', e);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta('Error al guardar imágenes localmente. Espacio de almacenamiento agotado o error de seguridad.', 'danger');
        }
    }
}

function getProductImagesFromLocalStorage(productId) {
    try {
        const imageDataString = localStorage.getItem(`productImages_${productId}`);
        if (imageDataString) {
            return JSON.parse(imageDataString);
        }
    } catch (e) {
        console.error('Error al leer imágenes de localStorage:', e);
    }
    return null; // O un objeto predeterminado si no se encuentra
}

function removeProductImagesFromLocalStorage(productId) {
    try {
        localStorage.removeItem(`productImages_${productId}`);
        console.log(`Imágenes eliminadas de localStorage para producto ${productId}`);
    } catch (e) {
        console.error('Error al eliminar imágenes de localStorage:', e);
    }
}

// --- FIN DE LAS NUEVAS FUNCIONES ---


async function loadData() {
    try {
        products = await apiFetch(API_PRODUCT_BASE_URL, '');
        console.log('Todos los productos cargados desde el backend:', products);

        // --- Extender productos con URLs de imágenes desde localStorage ---
        products = products.map(product => {
            const localImages = getProductImagesFromLocalStorage(product.idProducto);
            if (localImages) {
                // Si encontramos imágenes en localStorage, las adjuntamos al objeto del producto
                return {
                    ...product,
                    mainImage: localImages.mainImage || null,
                    additionalImages: localImages.additionalImages || []
                };
            }
            return product; // Devuelve el producto tal como viene del backend si no hay imágenes locales
        });
        console.log('Productos con imágenes de localStorage:', products);


        categories = [...defaultCategories]; 
        console.log('Categorías cargadas desde el frontend (por defecto):', categories);
        
    } catch (error) {
        console.error('Error general al cargar productos desde el backend:', error);
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`No se pudieron cargar los productos del backend: ${error.message}`, 'warning');
        } else {
            alert(`No se pudieron cargar los productos del backend: ${error.message}`);
        }
        products = [];
        // Incluso si el backend falla, aún podemos intentar cargar categorías y limpiar imágenes.
        categories = [...defaultCategories]; // Asegurarse de que las categorías estén siempre disponibles
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
        // Las URLs de las imágenes NO se envían al backend
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
        let createdOrUpdatedProduct; 

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

        if (createdOrUpdatedProduct) {
            // Guardar las URLs de las imágenes en localStorage con el ID del producto
            // Este ID debe ser el que el backend devuelve para el producto recién creado/actualizado.
            saveProductImagesToLocalStorage(createdOrUpdatedProduct.idProducto, currentMainImageUrl, currentAdditionalImageUrls);
            
            // Asigna las URLs de las imágenes temporales al producto para la renderización inmediata en el frontend
            createdOrUpdatedProduct.mainImage = currentMainImageUrl;
            createdOrUpdatedProduct.additionalImages = currentAdditionalImageUrls;

            if (editingProductId) {
                const index = products.findIndex(p => p.idProducto === createdOrUpdatedProduct.idProducto);
                if (index !== -1) {
                    products[index] = createdOrUpdatedProduct;
                }
            } else {
                products.push(createdOrUpdatedProduct);
            }
        }
        
        updateUI(); 

        e.target.reset(); 

        editingProductId = null;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Agregar Producto';

        const featuredCheckbox = document.getElementById('productFeatured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = false; 
        }

        // Limpia la vista previa de imágenes y las URLs de Cloudinary temporales
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imagesPreview').innerHTML = '';
        const uploadedAdditionalImagesInput = document.getElementById('uploadedAdditionalImages');
        if (uploadedAdditionalImagesInput) {
            uploadedAdditionalImagesInput.value = '[]';
        }
        currentMainImageUrl = ''; 
        currentAdditionalImageUrls = []; 

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

    productsToDisplay = products.filter(product => {
        const nameMatch = !searchTerm || product.nombreProducto?.toLowerCase().includes(searchTerm);
        const categoryMatch = !categoryFilter || product.categoria?.toLowerCase() === categoryFilter.toLowerCase();
        return nameMatch && categoryMatch;
    });

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
        // Las propiedades mainImage y additionalImages deberían estar disponibles
        // en el objeto 'product' porque fueron adjuntadas en loadData() desde localStorage.
        const mainImageUrl = product.mainImage || 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen';
        const additionalImages = product.additionalImages || [];

        let carouselIndicators = `
            <button type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
        `;
        additionalImages.forEach((_, index) => {
            carouselIndicators += `
                <button type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide-to="${index + 1}" aria-label="Slide ${index + 2}"></button>
            `;
        });

        let carouselItems = `
            <div class="carousel-item active">
                <img src="${mainImageUrl}" class="d-block w-100" alt="${product.nombreProducto}" style="height: 200px; object-fit: cover;">
            </div>
        `;
        additionalImages.forEach(imgUrl => {
            carouselItems += `
                <div class="carousel-item">
                    <img src="${imgUrl}" class="d-block w-100" alt="Imagen adicional" style="height: 200px; object-fit: cover;">
                </div>
            `;
        });

        const needsCarouselControls = (additionalImages.length > 0 || mainImageUrl !== 'https://via.placeholder.com/200/CCCCCC/000000?text=Sin+Imagen');

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
                        ${needsCarouselControls ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${product.idProducto}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                        ` : ''}
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
        console.log('Producto cargado para edición desde backend:', product);

        // --- Cargar imágenes de localStorage para el producto que se está editando ---
        const localImages = getProductImagesFromLocalStorage(productId);
        if (localImages) {
            currentMainImageUrl = localImages.mainImage || '';
            currentAdditionalImageUrls = localImages.additionalImages || [];
            console.log('Imágenes cargadas de localStorage para edición:', currentMainImageUrl, currentAdditionalImageUrls);
        } else {
            currentMainImageUrl = '';
            currentAdditionalImageUrls = [];
        }

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

        const imagePreview = document.getElementById('imagePreview');
        const imagesPreviewContainer = document.getElementById('imagesPreview');
        const uploadedAdditionalImagesInput = document.getElementById('uploadedAdditionalImages');

        // Mostrar las imágenes cargadas de localStorage en la vista previa del formulario
        if (imagePreview && currentMainImageUrl) {
            imagePreview.innerHTML = `<div class="position-relative"><img src="${currentMainImageUrl}" class="img-thumbnail" style="max-height: 200px"></div>`;
        } else if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        if (uploadedAdditionalImagesInput) {
            uploadedAdditionalImagesInput.value = JSON.stringify(currentAdditionalImageUrls);
        }
        updateAdditionalImagesPreview(); // Llama a esta función para renderizar las imágenes adicionales

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
            // Remover el producto del array 'products' en el frontend
            products = products.filter(p => p.idProducto !== productId);
            removeProductImagesFromLocalStorage(productId); // --- Eliminar también de localStorage ---
            updateUI(); 

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
        product.featured = newFeaturedState; 

        updateProductList(); 

        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta(`Producto ${newFeaturedState ? 'marcado como favorito' : 'desmarcado de favoritos'}`, 'success');
        } else {
            alert(`Producto ${newFeaturedState ? 'marcado como favorito' : 'desmarcado de favoritos'}`);
        }

    } catch (error) {
        
        console.error('Error interno al cambiar estado de favorito en frontend:', error);
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
    const uploadedAdditionalImagesInput = document.getElementById('uploadedAdditionalImages');

    if (!uploadImageBtn || !uploadMultipleBtn) {
        console.warn('Botones de carga de imagen de Cloudinary no encontrados. La funcionalidad de carga de imágenes no estará disponible.');
        return;
    }

    const uploadWidget = cloudinary.createUploadWidget({
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        multiple: true,
        maxFiles: 5
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
                if (uploadedAdditionalImagesInput) {
                    uploadedAdditionalImagesInput.value = JSON.stringify(currentAdditionalImageUrls);
                }
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
        uploadWidget.lastButtonClicked = 'main';
        uploadWidget.open();
    });

    uploadMultipleBtn.addEventListener('click', () => {
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
        if (uploadedAdditionalImagesInput) {
            uploadedAdditionalImagesInput.value = JSON.stringify(currentAdditionalImageUrls);
        }
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