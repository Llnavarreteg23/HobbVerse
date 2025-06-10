const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

let products = [];
let categories = [];
let editingCategoryId = null;
let editingProductId = null;
let imageCount = 0;

// Configuración de la API
const API_BASE_URL = '/api'; // Ajustar según la URL base de tu API
const API_ENDPOINTS = {
    products: `${API_BASE_URL}/productos`,
    categories: `${API_BASE_URL}/categorias`
};

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos y configuraciones
    loadData();
    setupEventListeners();
    initImageUpload();
    setupFilters();
});

function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('addImageBtn').addEventListener('click', addImageInput);
    document.getElementById('searchProducts').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
}

async function loadData() {
    try {
        // Cargar categorías primero
        await loadCategories();
        
        // Cargar productos desde la API
        await loadProducts();
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Valores por defecto si falla la carga
        if (!products || !Array.isArray(products)) {
            products = [];
        }
    }

    updateUI();
}

async function loadProducts() {
    try {
        const response = await fetch(API_ENDPOINTS.products);
        
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`);
        }
        
        products = await response.json();
        
        // Normalizar formato si es necesario
        products = products.map(producto => ({
            id: producto.id || Date.now().toString(),
            name: producto.name || producto.nombre || '',
            category: producto.category || producto.categoria || '',
            description: producto.description || producto.descripcion || '',
            price: parseFloat(producto.price || producto.precio || 0),
            stock: parseInt(producto.stock || 0),
            mainImage: producto.mainImage || producto.imagen || '',
            additionalImages: producto.additionalImages || producto.imagenesAdicionales || [],
            featured: producto.featured || producto.destacado || false
        }));
        
    } catch (error) {
        console.error('Error al cargar productos desde la API:', error);
        
        // Intentar cargar desde localStorage como respaldo
        const storedProducts = localStorage.getItem('productos');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            products = [];
        }
    }
}

async function loadCategories() {
    try {
        const response = await fetch(API_ENDPOINTS.categories);
        
        if (!response.ok) {
            throw new Error(`Error al cargar categorías: ${response.status}`);
        }
        
        categories = await response.json();
        
        // Normalizar formato si es necesario
        categories = categories.map(cat => ({
            id: cat.id,
            name: cat.name || cat.nombre
        }));
        
    } catch (error) {
        console.error('Error al cargar categorías desde la API:', error);
        
        // Intentar cargar desde localStorage como respaldo
        const storedCategories = localStorage.getItem('hobbverse_categories');
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            // Categorías por defecto
            categories = [
                { id: 1, name: "Deportes" },
                { id: 2, name: "Arte" },
                { id: 3, name: "Música" }
            ];
        }
    }
}

async function saveProduct(product) {
    try {
        const url = editingProductId 
            ? `${API_ENDPOINTS.products}/${product.id}` 
            : API_ENDPOINTS.products;
        
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) {
            throw new Error(`Error al guardar producto: ${response.status}`);
        }
        
        // Actualizar el producto en la lista local
        return await response.json();
        
    } catch (error) {
        console.error('Error al guardar producto en la API:', error);
        
        // Respaldo: guardar en localStorage
        if (editingProductId) {
            const index = products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                products[index] = product;
            } else {
                products.push(product);
            }
        } else {
            // Asignar ID local
            product.id = Date.now().toString();
            products.push(product);
        }
        
        localStorage.setItem('productos', JSON.stringify(products));
        return product;
    }
}

async function deleteProductFromAPI(productId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.products}/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error al eliminar producto: ${response.status}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al eliminar producto de la API:', error);
        return false;
    }
}

async function saveCategory(category) {
    try {
        const url = editingCategoryId 
            ? `${API_ENDPOINTS.categories}/${category.id}` 
            : API_ENDPOINTS.categories;
        
        const method = editingCategoryId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        });
        
        if (!response.ok) {
            throw new Error(`Error al guardar categoría: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error al guardar categoría en la API:', error);
        
        // Respaldo: guardar en localStorage
        if (editingCategoryId) {
            const index = categories.findIndex(c => c.id === category.id);
            if (index !== -1) {
                categories[index] = category;
            } else {
                categories.push(category);
            }
        } else {
            // Asignar ID local
            category.id = Date.now();
            categories.push(category);
        }
        
        localStorage.setItem('hobbverse_categories', JSON.stringify(categories));
        return category;
    }
}

async function deleteCategoryFromAPI(categoryId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.categories}/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error al eliminar categoría: ${response.status}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al eliminar categoría de la API:', error);
        return false;
    }
}

function addImageInput() {
    imageCount++;
    const container = document.createElement('div');
    container.className = 'additional-image';
    container.innerHTML = `
        <label class="form-label small text-muted">Imagen adicional ${imageCount}</label>
        <div class="d-flex gap-2">
            <input type="url" class="form-control" name="additionalImage${imageCount}" 
                   placeholder="URL de la imagen adicional">
            <button type="button" class="remove-image" title="Eliminar imagen">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    `;

    container.querySelector('.remove-image').addEventListener('click', function() {
        container.remove();
    });

    document.getElementById('additionalImages').appendChild(container);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const productData = {
        id: editingProductId || undefined,
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        mainImage: formData.get('mainImage'),
        additionalImages: Array.from(document.querySelectorAll('[name^="additionalImage"]'))
            .map(input => input.value)
            .filter(url => url),
        featured: formData.get('featured') === 'on'
    };

    try {
        const savedProduct = await saveProduct(productData);
        
        // Si es un producto nuevo, agregar a la lista
        if (!editingProductId) {
            products.push(savedProduct);
        } else {
            // Si es actualización, actualizar en la lista
            const index = products.findIndex(p => p.id === savedProduct.id);
            if (index !== -1) {
                products[index] = savedProduct;
            } else {
                products.push(savedProduct);
            }
        }
        
        // Actualizar UI
        updateProductList();
        e.target.reset();
        
        // Resetear estado de edición
        editingProductId = null;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Agregar Producto';

        // Mostrar mensaje de éxito
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta('Producto guardado exitosamente', 'success');
        } else {
            alert('Producto guardado exitosamente');
        }
        
    } catch (error) {
        console.error('Error al guardar producto:', error);
        
        if (typeof mostrarAlerta === 'function') {
            mostrarAlerta('Error al guardar producto: ' + error.message, 'danger');
        } else {
            alert('Error al guardar producto: ' + error.message);
        }
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryName = formData.get('categoryName').trim();

    if (!categoryName) {
        alert('El nombre de la categoría no puede estar vacío');
        return;
    }

    try {
        let categoryData;
        
        if (editingCategoryId) {
            const index = categories.findIndex(cat => cat.id === editingCategoryId);
            if (index !== -1) {
                categoryData = {
                    id: editingCategoryId,
                    name: categoryName
                };
            }
        } else {
            categoryData = {
                name: categoryName
            };
        }
        
        const savedCategory = await saveCategory(categoryData);
        
        // Actualizar la lista local
        if (editingCategoryId) {
            const index = categories.findIndex(cat => cat.id === editingCategoryId);
            if (index !== -1) {
                categories[index] = savedCategory;
            }
            editingCategoryId = null;
            e.target.querySelector('button[type="submit"]').textContent = 'Agregar Categoría';
        } else {
            categories.push(savedCategory);
        }
        
        updateUI();
        e.target.reset();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        alert('Error al guardar categoría: ' + error.message);
    }
}

function updateUI() {
    updateCategoryList();
    updateProductList();
    updateCategorySelect();
    updateProductCount(products.length);
}

function updateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.innerHTML = categories.map(category => `
        <li class="category-item">
            ${category.name}
            <div>
                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    // Filtrar productos
    const filteredProducts = products.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm);
        const categoryMatch = !categoryFilter || 
                            (product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());
        
        return (nameMatch || descriptionMatch) && categoryMatch;
    });
    
    // Actualizar la lista de productos con los filtrados
    updateProductList(filteredProducts);
    updateProductCount(filteredProducts.length);
}

function updateProductList(filteredProducts = null) {
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    const productos = filteredProducts || products;

    productList.innerHTML = productos.map(product => `
        <div class="col">
            <div class="card h-100 ${product.featured ? 'border-warning' : ''}">
                <div id="carousel-${product.id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#carousel-${product.id}" data-bs-slide-to="0" class="active"></button>
                        ${(product.additionalImages || []).map((_, index) => `
                            <button type="button" data-bs-target="#carousel-${product.id}" data-bs-slide-to="${index + 1}"></button>
                        `).join('')}
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="${product.mainImage || 'https://placehold.co/600x400?text=Sin+imagen'}" 
                                 class="d-block w-100" alt="${product.name}" 
                                 style="height: 200px; object-fit: cover;">
                        </div>
                        ${(product.additionalImages || []).map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="Imagen adicional" 
                                     style="height: 200px; object-fit: cover;">
                            </div>
                        `).join('')}
                    </div>
                    ${(product.additionalImages && product.additionalImages.length > 0) ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${product.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${product.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    ` : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name || 'Sin nombre'}</h5>
                    <p class="card-text">${product.description || 'Sin descripción'}</p>
                    <p class="card-text"><strong>Precio: </strong>${formatter.format(product.price || 0)}</p>
                    <p class="card-text"><strong>Categoría: </strong>${product.category || 'Sin categoría'}</p>
                    <p class="card-text"><strong>Stock: </strong>${product.stock || 0}</p>
                    <div class="btn-group w-100">
                        <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${product.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="toggleFeatured('${product.id}')">
                            <i class="bi bi-star${product.featured ? '-fill' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Inicializar todos los carruseles
    productos.forEach(product => {
        if (product.additionalImages && product.additionalImages.length > 0) {
            const carouselElement = document.getElementById(`carousel-${product.id}`);
            if (carouselElement) {
                try {
                    new bootstrap.Carousel(carouselElement, {
                        interval: 3000
                    });
                } catch (error) {
                    console.error('Error al inicializar carrusel:', error);
                }
            }
        }
    });
}

function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = count === products.length 
            ? `Total: ${products.length} productos` 
            : `Mostrando ${count} de ${products.length} productos`;
    }
}

async function toggleFeatured(productId) {
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        try {
            const product = { ...products[index] };
            product.featured = !product.featured;
            
            // Actualizar en la API
            const updatedProduct = await saveProduct(product);
            
            // Actualizar en la lista local
            products[index] = updatedProduct;
            updateProductList();
            
        } catch (error) {
            console.error('Error al actualizar estado destacado:', error);
            
            // Cambio local como respaldo
            products[index].featured = !products[index].featured;
            localStorage.setItem('productos', JSON.stringify(products));
            updateProductList();
        }
    }
}

function updateCategorySelect() {
    const categorySelects = document.querySelectorAll('select[name="category"], #categoryFilter');
    
    if (categorySelects.length === 0) return;
    
    const options = `
        ${document.querySelector('#categoryFilter') ? '<option value="">Todas las categorías</option>' : ''}
        ${categories.map(category => 
            `<option value="${category.name}">${category.name}</option>`
        ).join('')}
    `;
    
    categorySelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = options;
        
        // Intentar mantener el valor seleccionado si existía
        if (currentValue && categories.some(cat => cat.name === currentValue)) {
            select.value = currentValue;
        }
    });
}

async function editProduct(productId) {
    let producto = products.find(p => p.id === productId);
    
    if (!producto) {
        try {
            // Intentar obtener el producto desde la API
            const response = await fetch(`${API_ENDPOINTS.products}/${productId}`);
            
            if (response.ok) {
                producto = await response.json();
                
                // Añadir a la lista local si no existe
                if (!products.some(p => p.id === productId)) {
                    products.push(producto);
                }
            } else {
                // Buscar en localStorage como respaldo
                const storedProducts = localStorage.getItem('productos');
                if (storedProducts) {
                    const localProducts = JSON.parse(storedProducts);
                    producto = localProducts.find(p => p.id === productId);
                    
                    if (producto && !products.some(p => p.id === productId)) {
                        products.push(producto);
                    }
                }
            }
        } catch (error) {
            console.error('Error buscando producto:', error);
        }
    }
    
    if (!producto) {
        console.error('Producto no encontrado:', productId);
        alert('No se pudo encontrar el producto para editar');
        return;
    }

    const form = document.getElementById('productForm');
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    
    // Asegurar que las categorías estén cargadas
    if (!categories || categories.length === 0) {
        loadCategories().then(() => {
            updateCategorySelect();
            fillProductForm(form, producto);
        });
    } else {
        fillProductForm(form, producto);
    }
}

function fillProductForm(form, producto) {
    // Llenar el formulario con los datos del producto
    form.elements['name'].value = producto.name || producto.nombre || '';
    
    // Asegurar que la categoría existe antes de asignarla
    const categoryValue = producto.category || '';
    form.elements['category'].value = categories.some(cat => cat.name === categoryValue) 
        ? categoryValue 
        : '';
    
    form.elements['description'].value = producto.description || '';
    form.elements['price'].value = producto.price || producto.precio || 0;
    form.elements['stock'].value = producto.stock || 0;
    form.elements['mainImage'].value = producto.mainImage || producto.imagen || '';
    form.elements['featured'].checked = producto.featured || false;

    // Limpiar y agregar imágenes adicionales
    const additionalImagesContainer = document.getElementById('additionalImages');
    additionalImagesContainer.innerHTML = '';
    imageCount = 0;

    if (producto.additionalImages && producto.additionalImages.length > 0) {
        producto.additionalImages.forEach(imgUrl => {
            imageCount++;
            const container = document.createElement('div');
            container.className = 'additional-image';
            container.innerHTML = `
                <label class="form-label small text-muted">Imagen adicional ${imageCount}</label>
                <div class="d-flex gap-2">
                    <input type="url" class="form-control" name="additionalImage${imageCount}" 
                           value="${imgUrl}" placeholder="URL de la imagen adicional">
                    <button type="button" class="remove-image" title="Eliminar imagen">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `;

            container.querySelector('.remove-image').addEventListener('click', function() {
                container.remove();
            });

            additionalImagesContainer.appendChild(container);
        });
    }

    // Actualizar el estado de edición
    editingProductId = producto.id;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Actualizar Producto';
    
    // Actualizar la vista previa de imagen principal
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview && producto.mainImage) {
        imagePreview.innerHTML = `
            <div class="position-relative">
                <img src="${producto.mainImage}" class="img-thumbnail" style="max-height: 200px">
            </div>
        `;
    }
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        // Intentar eliminar en la API
        const deleted = await deleteProductFromAPI(productId);
        
        if (deleted) {
            // Eliminar de la lista local
            products = products.filter(p => p.id !== productId);
            updateProductList();
            updateProductCount(products.length);
        } else {
            throw new Error('No se pudo eliminar el producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        
        // Eliminar localmente como respaldo
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('productos', JSON.stringify(products));
        updateProductList();
        updateProductCount(products.length);
    }
}

async function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    editingCategoryId = id;
    const form = document.getElementById('categoryForm');
    if (!form) return;
    
    form.elements['categoryName'].value = category.name;

    // Usar try-catch para manejar posibles errores con Bootstrap
    try {
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    } catch (error) {
        console.error('Error al mostrar modal de categoría:', error);
        // Alternativa si bootstrap falla
        const modalElement = document.getElementById('categoryModal');
        if (modalElement) modalElement.classList.add('show');
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Actualizar Categoría';
}

async function deleteCategory(id) {
    if (!confirm('¿Está seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
        return;
    }
    
    try {
        // Intentar eliminar en la API
        const deleted = await deleteCategoryFromAPI(id);
        
        if (deleted) {
            // Obtener el nombre de la categoría antes de eliminarla
            const categoryToDelete = categories.find(c => c.id === id);
            if (!categoryToDelete) return;
            
            const categoryName = categoryToDelete.name;
            
            // Eliminar la categoría
            categories = categories.filter(c => c.id !== id);
    
            // Actualizar los productos que tenían esta categoría
            const productsToUpdate = products.filter(p => p.category === categoryName);
            
            // Actualizar productos en el backend
            for (const producto of productsToUpdate) {
                const updatedProduct = { ...producto, category: '' };
                await saveProduct(updatedProduct);
            }
            
            // Actualizar productos localmente
            products = products.map(p => {
                if (p.category === categoryName) {
                    return { ...p, category: '' };
                }
                return p;
            });
            
            updateUI();
        } else {
            throw new Error('No se pudo eliminar la categoría');
        }
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        
        // Eliminar localmente como respaldo
        // Obtener el nombre de la categoría antes de eliminarla
        const categoryToDelete = categories.find(c => c.id === id);
        if (!categoryToDelete) return;
        
        const categoryName = categoryToDelete.name;
        
        // Eliminar la categoría
        categories = categories.filter(c => c.id !== id);
        
        // Actualizar los productos que tenían esta categoría
        products = products.map(p => {
            if (p.category === categoryName) {
                return { ...p, category: '' };
            }
            return p;
        });
        
        localStorage.setItem('hobbverse_categories', JSON.stringify(categories));
        localStorage.setItem('productos', JSON.stringify(products));
        
        updateUI();
    }
}

// Configuración de Cloudinary
const cloudinaryConfig = {
    cloudName: 'diljcypxv',
    uploadPreset: 'hobbverse_unsigned'
};

function initImageUpload() {
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!uploadImageBtn) return;
    
    // Verificar si cloudinary está disponible
    if (typeof cloudinary === 'undefined') {
        console.error('Cloudinary no está disponible. Asegúrate de incluir el script en tu HTML.');
        return;
    }

    // Configurar widget de Cloudinary
    const uploadWidget = cloudinary.createUploadWidget({
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        multiple: false
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            
            // Actualizar preview de imagen principal
            if (imagePreview) {
                imagePreview.innerHTML = `
                    <div class="position-relative">
                        <img src="${imageUrl}" class="img-thumbnail" style="max-height: 200px">
                    </div>
                `;
            }
            
            // Actualizar el campo de entrada oculto
            const mainImageInput = document.getElementById('mainImage') || document.querySelector('input[name="mainImage"]');
            if (mainImageInput) {
                mainImageInput.value = imageUrl;
            } else {
                // Si no existe el campo, crearlo
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'mainImage';
                input.id = 'mainImage';
                input.value = imageUrl;
                document.getElementById('productForm').appendChild(input);
            }
        }
    });

    // Botón de imagen principal
    uploadImageBtn.addEventListener('click', () => {
        uploadWidget.open();
    });
    
    // Configurar el botón para imágenes adicionales si existe
    const uploadMultipleBtn = document.getElementById('uploadMultipleBtn');
    if (uploadMultipleBtn) {
        uploadMultipleBtn.addEventListener('click', () => {
            // Abre el widget con configuración para múltiples imágenes
            const multipleWidget = cloudinary.createUploadWidget({
                cloudName: cloudinaryConfig.cloudName,
                uploadPreset: cloudinaryConfig.uploadPreset,
                multiple: true
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    addImageInput();
                    const inputs = document.querySelectorAll('#additionalImages .additional-image:last-child input');
                    if (inputs.length > 0) {
                        inputs[0].value = result.info.secure_url;
                    }
                }
            });
            
            multipleWidget.open();
        });
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchProducts');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
}

// Inicialización para asegurar que todo se carga correctamente
window.addEventListener('load', function() {
    // Verificar si los datos ya se cargaron
    if (products.length === 0 || categories.length === 0) {
        loadData();
    } else {
        updateUI();
    }
});