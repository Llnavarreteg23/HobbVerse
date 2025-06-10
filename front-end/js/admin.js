// Configuración de la API
const API_BASE_URL = '/api';
const API_ENDPOINTS = {
    products: `${API_BASE_URL}/productos`,
    categories: `${API_BASE_URL}/categorias`
};

// Claves para localStorage
const STORAGE_KEYS = {
    products: 'hobbverse_products',
    categories: 'hobbverse_categories'
};

// Variables globales
let products = [];
let categories = [];
let editingProductId = null;
let editingCategoryId = null;
let cloudinaryWidget;
let multipleImagesWidget;
let additionalImagesArray = [];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando administrador...');
    
    // Cargar datos del localStorage primero para tener algo que mostrar inmediatamente
    loadFromLocalStorage();
    
    // Inicializar widgets de Cloudinary
    initializeCloudinary();
    
    // Cargar datos del servidor (esto sobrescribirá los datos locales si tiene éxito)
    try {
        await Promise.all([loadCategories(), loadProducts()]);
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar UI
    updateProductList();
    updateCategoryOptions();
});

// Cargar datos desde localStorage
function loadFromLocalStorage() {
    try {
        // Intentar cargar categorías
        const storedCategories = localStorage.getItem(STORAGE_KEYS.categories);
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
            console.log('Categorías cargadas desde localStorage:', categories);
        }
        
        // Intentar cargar productos
        const storedProducts = localStorage.getItem(STORAGE_KEYS.products);
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            console.log('Productos cargados desde localStorage:', products);
        }
    } catch (e) {
        console.error('Error al cargar datos desde localStorage:', e);
    }
}

// Guardar datos en localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
        console.log('Datos guardados en localStorage');
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
    }
}

// Configurar Cloudinary para carga de imágenes
function initializeCloudinary() {
    try {
        console.log('Inicializando Cloudinary...');
        // Widget para imagen principal
        cloudinaryWidget = cloudinary.createUploadWidget(
            {
                cloudName: 'diljcypxv',
                uploadPreset: 'hobbverse',
                sources: ['local', 'url', 'camera'],
                multiple: false,
                maxFiles: 1
            },
            (error, result) => {
                if (error) {
                    console.error('Error en widget de Cloudinary:', error);
                }
                
                if (!error && result && result.event === "success") {
                    console.log('Imagen cargada con éxito:', result.info.secure_url);
                    // Obtener la URL de la imagen cargada
                    const imageUrl = result.info.secure_url;
                    document.getElementById('mainImage').value = imageUrl;
                    
                    // Mostrar vista previa de la imagen
                    updateImagePreview(imageUrl);
                }
            }
        );
        
        // Widget para múltiples imágenes
        multipleImagesWidget = cloudinary.createUploadWidget(
            {
                cloudName: 'diljcypxv',
                uploadPreset: 'hobbverse',
                sources: ['local', 'url', 'camera'],
                multiple: true,
                maxFiles: 5
            },
            (error, result) => {
                if (error) {
                    console.error('Error en widget múltiple de Cloudinary:', error);
                }
                
                if (!error && result && result.event === "success") {
                    console.log('Imagen adicional cargada:', result.info.secure_url);
                    // Añadir URL de imagen al array
                    additionalImagesArray.push(result.info.secure_url);
                    
                    // Actualizar el campo oculto
                    document.getElementById('additionalImages').value = JSON.stringify(additionalImagesArray);
                    
                    // Actualizar vista previa
                    updateAdditionalImagesPreview();
                }
            }
        );
        
        console.log('Cloudinary inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Cloudinary:', error);
        alert('No se pudo inicializar el cargador de imágenes. Algunas funciones pueden no estar disponibles.');
    }
}

// Actualizar la vista previa de la imagen principal
function updateImagePreview(imageUrl) {
    const previewElement = document.getElementById('imagePreview');
    previewElement.innerHTML = imageUrl ? 
        `<img src="${imageUrl}" alt="Vista previa" class="img-thumbnail mt-2" style="max-height: 150px">` : '';
}

// Actualizar vista previa de imágenes adicionales
function updateAdditionalImagesPreview() {
    const previewElement = document.getElementById('imagesPreview');
    previewElement.innerHTML = '';
    
    additionalImagesArray.forEach((url, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'position-relative d-inline-block me-2 mb-2';
        
        imgContainer.innerHTML = `
            <img src="${url}" alt="Imagen adicional ${index+1}" class="img-thumbnail" style="height: 100px; width: auto;">
            <button type="button" class="btn btn-sm custom-elimnar-img position-absolute top-0 end-0" 
                    data-index="${index}">
                <i class="bi bi-x custom-x-icon"></i>
            </button>
        `;
        
        // Añadir evento para eliminar imagen
        const deleteBtn = imgContainer.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            additionalImagesArray.splice(index, 1);
            document.getElementById('additionalImages').value = JSON.stringify(additionalImagesArray);
            updateAdditionalImagesPreview();
        });
        
        previewElement.appendChild(imgContainer);
    });
}

// Cargar categorías desde la API
async function loadCategories() {
    console.log('Cargando categorías...');
    try {
        console.log('Intentando cargar categorías desde:', API_ENDPOINTS.categories);
        const response = await fetch(API_ENDPOINTS.categories);
        
        console.log('Respuesta de categorías:', response);
        
        if (!response.ok) {
            throw new Error(`Error al cargar categorías: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos de categorías recibidos:', data);
        
        categories = data;
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        // Actualizar UI
        updateCategoryList();
        updateCategoryOptions();
        
        return data;
        
    } catch (error) {
        console.error('Error al cargar categorías desde la API:', error);
        
        // Si no hay categorías o hubo un error, usar datos predeterminados
        if (!categories || categories.length === 0) {
            console.log('Usando categorías predeterminadas');
            categories = [
                { id: 1, name: 'Deportes' },
                { id: 2, name: 'Arte' },
                { id: 3, name: 'Música' },
                { id: 4, name: 'Juegos de mesa' },
                { id: 5, name: 'Coleccionables' }
            ];
            
            // Guardar categorías predeterminadas en localStorage
            saveToLocalStorage();
            
            // Actualizar UI
            updateCategoryList();
            updateCategoryOptions();
        }
        
        return categories;
    }
}

// Cargar productos desde la API
async function loadProducts() {
    console.log('Cargando productos...');
    try {
        console.log('Intentando cargar productos desde:', API_ENDPOINTS.products);
        const response = await fetch(API_ENDPOINTS.products);
        
        console.log('Respuesta de productos:', response);
        
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.status}`);
        }
        
        let productsData = await response.json();
        console.log('Datos de productos recibidos:', productsData);
        
        // Normalizar formato para manejar tanto inglés como español
        products = productsData.map(producto => ({
            id: producto.id || producto.idProducto || Date.now().toString(),
            name: producto.name || producto.nombreProducto || '',
            category: producto.category || producto.categoria || '',
            description: producto.description || producto.descripcion || '',
            price: parseFloat(producto.price || (producto.precio ? producto.precio : 0)),
            stock: parseInt(producto.stock || producto.cantidad || 0),
            mainImage: producto.mainImage || producto.imagen || '',
            additionalImages: producto.additionalImages || producto.imagenesAdicionales || [],
            featured: producto.featured || producto.destacado || false
        }));
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        // Actualizar lista de productos
        updateProductList();
        return products;
        
    } catch (error) {
        console.error('Error al cargar productos desde la API:', error);
        
        // Si no hay productos o hubo un error, usar datos de ejemplo solo si no hay datos locales
        if (!products || products.length === 0) {
            console.log('Usando productos de demostración');
            products = [
                {
                    id: 1,
                    name: 'Balón de fútbol profesional',
                    category: 'Deportes',
                    description: 'Balón de fútbol de alta calidad para profesionales',
                    price: 120000,
                    stock: 50,
                    mainImage: 'https://via.placeholder.com/300x300?text=Balón+de+fútbol',
                    additionalImages: [
                        'https://via.placeholder.com/300x300?text=Balón+1',
                        'https://via.placeholder.com/300x300?text=Balón+2'
                    ],
                    featured: true
                },
                {
                    id: 2,
                    name: 'Set de pintura al óleo',
                    category: 'Arte',
                    description: 'Kit completo de pintura al óleo con 24 colores y pinceles',
                    price: 85000,
                    stock: 30,
                    mainImage: 'https://via.placeholder.com/300x300?text=Set+de+pintura',
                    additionalImages: [],
                    featured: false
                }
            ];
            
            // Guardar productos de ejemplo en localStorage
            saveToLocalStorage();
        }
        
        updateProductList();
        return products;
    }
}

// Configurar todos los event listeners
function setupEventListeners() {
    console.log('Configurando eventos...');
    
    // Form de productos
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Form de categorías
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    
    // Botón de cargar imagen principal
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        try {
            cloudinaryWidget.open();
        } catch (e) {
            console.error('Error al abrir widget de Cloudinary:', e);
            alert('No se pudo abrir el cargador de imágenes. Intenta nuevamente.');
        }
    });
    
    // Botón para agregar imágenes adicionales
    document.getElementById('uploadMultipleBtn').addEventListener('click', () => {
        try {
            multipleImagesWidget.open();
        } catch (e) {
            console.error('Error al abrir widget múltiple de Cloudinary:', e);
            alert('No se pudo abrir el cargador de imágenes múltiples. Intenta nuevamente.');
        }
    });
    
    // Filtros y búsqueda
    document.getElementById('searchProducts').addEventListener('input', updateProductList);
    document.getElementById('categoryFilter').addEventListener('change', updateProductList);
    
    console.log('Eventos configurados correctamente');
}

// Manejar envío del formulario de productos
async function handleProductSubmit(event) {
    event.preventDefault();
    console.log('Procesando envío de producto...');
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Obtener imágenes adicionales del campo oculto
    let additionalImages = [];
    try {
        if (document.getElementById('additionalImages').value) {
            additionalImages = JSON.parse(document.getElementById('additionalImages').value);
        }
    } catch (e) {
        console.error('Error al parsear imágenes adicionales:', e);
    }
    
    // Crear objeto del producto
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        mainImage: document.getElementById('mainImage').value || formData.get('img'), // Compatibilidad con ambos campos
        additionalImages: additionalImages,
        featured: document.getElementById('featuredCheck').checked
    };
    
    console.log('Datos del producto a guardar:', product);
    
    // Validaciones básicas
    if (!product.name || !product.category || !product.description || isNaN(product.price) || isNaN(product.stock)) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Si estamos editando, incluir el ID
    if (editingProductId) {
        product.id = editingProductId;
    } else {
        // Generar un ID único para nuevos productos
        product.id = Date.now();
    }
    
    try {
        await saveProduct(product);
        
        // Refrescar lista de productos
        await loadProducts();
        
        // Resetear formulario
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imagesPreview').innerHTML = '';
        document.getElementById('mainImage').value = '';
        document.getElementById('additionalImages').value = '';
        additionalImagesArray = [];
        editingProductId = null;
        
        // Mostrar notificación
        alert(editingProductId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
        
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto. Intenta nuevamente.');
    }
}

// Guardar producto en la API y localStorage
async function saveProduct(product) {
    console.log('Guardando producto en la API y localStorage...');
    try {
        // Preparar el producto para enviarlo al backend, incluyendo nombres en español
        const productToSave = {
            ...product,
            // Propiedades en español para el backend
            nombreProducto: product.name,
            categoria: product.category,
            descripcion: product.description,
            precio: product.price,
            cantidad: product.stock,
            imagen: product.mainImage,
            imagenesAdicionales: product.additionalImages,
            destacado: product.featured
        };
        
        // Si tiene ID, incluirlo en formato español
        if (product.id) {
            productToSave.idProducto = product.id;
            productToSave.id = product.id;
        }
        
        const url = editingProductId 
            ? `${API_ENDPOINTS.products}/${product.id}` 
            : API_ENDPOINTS.products;
        
        const method = editingProductId ? 'PUT' : 'POST';
        
        console.log(`Enviando ${method} a ${url} con datos:`, productToSave);
        
        let backendSaveSuccessful = false;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productToSave)
            });
            
            console.log('Respuesta del servidor:', response);
            
            if (!response.ok) {
                throw new Error(`Error al guardar producto: ${response.status}`);
            }
            
            const savedProduct = await response.json();
            console.log('Producto guardado con éxito en el backend:', savedProduct);
            backendSaveSuccessful = true;
            
            // Si el backend devuelve un ID, usarlo
            if (savedProduct.id || savedProduct.idProducto) {
                product.id = savedProduct.id || savedProduct.idProducto;
            }
            
        } catch (apiError) {
            console.error('Error al guardar en la API:', apiError);
            // Continuamos para guardar localmente
        }
        
        // Siempre guardar/actualizar localmente
        if (editingProductId) {
            // Editar localmente
            const index = products.findIndex(p => p.id == editingProductId);
            if (index !== -1) {
                products[index] = { ...products[index], ...product };
                console.log('Producto actualizado localmente:', products[index]);
            } else {
                // Si no se encuentra, agregarlo como nuevo
                products.push(product);
                console.log('Producto no encontrado para editar, se agregó como nuevo:', product);
            }
        } else {
            // Crear localmente
            products.push(product);
            console.log('Producto creado localmente:', product);
        }
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        // Actualizar la UI
        updateProductList();
        
        return product;
        
    } catch (error) {
        console.error('Error general al guardar producto:', error);
        throw error;
    }
}

// Manejar envío del formulario de categorías
async function handleCategorySubmit(event) {
    event.preventDefault();
    console.log('Procesando envío de categoría...');
    
    const categoryName = document.querySelector('#categoryForm input[name="categoryName"]').value.trim();
    console.log('Nombre de categoría a guardar:', categoryName);
    
    if (!categoryName) {
        alert('Por favor ingresa un nombre para la categoría');
        return;
    }
    
    try {
        // Preparar el objeto de categoría
        let categoryToSave = {
            name: categoryName
        };
        
        if (editingCategoryId) {
            categoryToSave.id = editingCategoryId;
        } else {
            // Generar un ID único para nuevas categorías
            categoryToSave.id = Date.now();
        }
        
        // Intentar guardar en el backend (puede fallar)
        const url = editingCategoryId 
            ? `${API_ENDPOINTS.categories}/${editingCategoryId}` 
            : API_ENDPOINTS.categories;
        
        const method = editingCategoryId ? 'PUT' : 'POST';
        console.log(`Enviando ${method} a ${url} con nombre: ${categoryName}`);
        
        let backendSaveSuccessful = false;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryToSave)
            });
            
            console.log('Respuesta del servidor para categoría:', response);
            
            if (!response.ok) {
                throw new Error(`Error al ${editingCategoryId ? 'actualizar' : 'crear'} categoría: ${response.status}`);
            }
            
            const categoryData = await response.json();
            console.log('Categoría guardada con éxito en el backend:', categoryData);
            backendSaveSuccessful = true;
            
            // Si el backend devuelve un ID, usarlo
            if (categoryData.id) {
                categoryToSave.id = categoryData.id;
            }
            
        } catch (apiError) {
            console.error('Error API al guardar categoría:', apiError);
            // Continuamos para guardar localmente
        }
        
        // Siempre guardar/actualizar localmente
        if (editingCategoryId) {
            // Editar localmente
            const index = categories.findIndex(c => c.id == editingCategoryId);
            if (index !== -1) {
                categories[index].name = categoryName;
                console.log('Categoría actualizada localmente:', categories[index]);
            } else {
                // Si no se encuentra, agregarla como nueva
                categories.push(categoryToSave);
                console.log('Categoría no encontrada para editar, se agregó como nueva:', categoryToSave);
            }
        } else {
            // Crear localmente
            categories.push(categoryToSave);
            console.log('Categoría creada localmente:', categoryToSave);
        }
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        // Actualizar interfaz
        updateCategoryList();
        updateCategoryOptions();
        
        // Limpiar formulario y cerrar modal
        document.querySelector('#categoryForm input[name="categoryName"]').value = '';
        editingCategoryId = null;
        
        const modalElement = document.getElementById('categoryModal');
        try {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                // Fallback manual si el modal instance no está disponible
                const bsModal = new bootstrap.Modal(modalElement);
                bsModal.hide();
            }
        } catch (e) {
            console.error('Error al cerrar modal:', e);
            // Intento alternativo de cerrar el modal
            $(modalElement).modal('hide');
        }
        
        // Notificar al usuario
        alert(editingCategoryId ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
        
    } catch (error) {
        console.error('Error general al guardar categoría:', error);
        alert(`Error: ${error.message}`);
    }
}

// Editar una categoría
function editCategory(id) {
    console.log('Editando categoría con ID:', id);
    const category = categories.find(cat => cat.id == id);
    
    if (!category) {
        console.error('Categoría no encontrada:', id);
        return;
    }
    
    // Establecer ID de edición
    editingCategoryId = id;
    
    // Llenar formulario
    document.querySelector('#categoryForm input[name="categoryName"]').value = category.name;
    
    // Mostrar modal
    try {
        const modalElement = document.getElementById('categoryModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    } catch (e) {
        console.error('Error al mostrar modal:', e);
        // Intento alternativo de mostrar el modal
        $(modalElement).modal('show');
    }
}

// Eliminar una categoría
async function deleteCategory(id) {
    console.log('Intentando eliminar categoría con ID:', id);
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados se quedarán sin categoría.')) {
        return;
    }
    
    try {
        let backendDeleteSuccessful = false;
        
        // Intentar eliminar en el backend
        try {
            console.log(`Enviando DELETE a ${API_ENDPOINTS.categories}/${id}`);
            const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
                method: 'DELETE'
            });
            
            console.log('Respuesta del servidor para eliminar categoría:', response);
            
            if (!response.ok) {
                throw new Error(`Error al eliminar categoría: ${response.status}`);
            }
            
            console.log('Categoría eliminada correctamente en el backend');
            backendDeleteSuccessful = true;
            
        } catch (apiError) {
            console.error('Error API al eliminar categoría:', apiError);
            // Continuamos para eliminar localmente
        }
        
        // Siempre eliminar localmente
        const categoryName = categories.find(c => c.id == id)?.name;
        categories = categories.filter(c => c.id != id);
        console.log('Categoría eliminada localmente');
        
        // Actualizar productos que usaban esta categoría
        if (categoryName) {
            products = products.map(p => {
                if (p.category === categoryName) {
                    return { ...p, category: '' };
                }
                return p;
            });
        }
        
        // Guardar cambios en localStorage
        saveToLocalStorage();
        
        // Actualizar interfaz
        updateCategoryList();
        updateCategoryOptions();
        updateProductList();
        
        // Notificar al usuario
        alert('Categoría eliminada correctamente');
        
    } catch (error) {
        console.error('Error general al eliminar categoría:', error);
        alert(`Error al eliminar la categoría: ${error.message}`);
    }
}

// Eliminar un producto
async function deleteProduct(id) {
    console.log('Intentando eliminar producto con ID:', id);
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        let backendDeleteSuccessful = false;
        
        // Intentar eliminar en el backend
        try {
            console.log(`Enviando DELETE a ${API_ENDPOINTS.products}/${id}`);
            const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
                method: 'DELETE'
            });
            
            console.log('Respuesta del servidor para eliminar producto:', response);
            
            if (!response.ok) {
                throw new Error(`Error al eliminar producto: ${response.status}`);
            }
            
            console.log('Producto eliminado correctamente en el backend');
            backendDeleteSuccessful = true;
            
        } catch (apiError) {
            console.error('Error API al eliminar producto:', apiError);
            // Continuamos para eliminar localmente
        }
        
        // Siempre eliminar localmente
        products = products.filter(p => p.id != id);
        console.log('Producto eliminado localmente');
        
        // Guardar cambios en localStorage
        saveToLocalStorage();
        
        // Actualizar UI
        updateProductList();
        
        // Notificar al usuario
        alert('Producto eliminado correctamente');
        
    } catch (error) {
        console.error('Error general al eliminar producto:', error);
        alert(`Error al eliminar el producto: ${error.message}`);
    }
}

// Editar un producto (cargar datos en el formulario)
function editProduct(id) {
    console.log('Editando producto con ID:', id);
    const product = products.find(p => p.id == id);
    
    if (!product) {
        console.error('Producto no encontrado:', id);
        return;
    }
    
    // Establecer ID de edición
    editingProductId = id;
    
    // Llenar formulario
    document.querySelector('input[name="name"]').value = product.name;
    
    // Asegurarse de que la categoría exista en el select
    const categorySelect = document.querySelector('select[name="category"]');
    let categoryExists = false;
    
    // Comprobar si la categoría existe en las opciones actuales
    for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].value === product.category) {
            categoryExists = true;
            break;
        }
    }
    
    // Si la categoría no existe, añadirla temporalmente
    if (!categoryExists && product.category) {
        const option = document.createElement('option');
        option.value = product.category;
        option.textContent = product.category;
        categorySelect.appendChild(option);
    }
    
    // Seleccionar la categoría
    categorySelect.value = product.category;
    
    // Continuar llenando el resto del formulario
    document.querySelector('textarea[name="description"]').value = product.description;
    document.querySelector('input[name="price"]').value = product.price;
    document.querySelector('input[name="stock"]').value = product.stock;
    document.getElementById('mainImage').value = product.mainImage;
    
    // Si existe, también actualizar el campo img
    const imgField = document.querySelector('input[name="img"]');
    if (imgField) {
        imgField.value = product.mainImage;
    }
    
    document.getElementById('featuredCheck').checked = product.featured;
    
    // Mostrar vista previa de la imagen principal
    updateImagePreview(product.mainImage);
    
    // Cargar imágenes adicionales
    additionalImagesArray = [...(product.additionalImages || [])];
    document.getElementById('additionalImages').value = JSON.stringify(additionalImagesArray);
    updateAdditionalImagesPreview();
    
    // Hacer scroll al formulario
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

// Actualizar lista de productos con filtros
function updateProductList() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    console.log(`Actualizando lista de productos - Búsqueda: "${searchTerm}", Categoría: "${categoryFilter}"`);
    
    // Filtrar productos
    let filteredProducts = [...products];
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Actualizar contador de productos
    document.getElementById('productCount').textContent = filteredProducts.length;
    
    // Actualizar lista visual
    const productListElement = document.getElementById('productList');
    productListElement.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
                <p class="mt-3 text-muted">No se encontraron productos que coincidan con tu búsqueda</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col';
        
        // Preparar HTML para el carrusel si hay imágenes adicionales
        let carouselHTML = '';
        
        if (product.additionalImages && product.additionalImages.length > 0) {
            // Construir el carrusel
            const carouselId = `carousel-${product.id}`;
            let carouselIndicators = '';
            let carouselItems = '';
            
            // Imagen principal como primer slide
            carouselItems += `
                <div class="carousel-item active">
                    <img src="${product.mainImage || 'https://via.placeholder.com/300x300?text=Imagen+Principal'}" 
                         class="d-block w-100" alt="${product.name}">
                </div>
            `;
            
            carouselIndicators += `
                <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="0" class="active" 
                        aria-current="true" aria-label="Slide 1"></button>
            `;
            
            // Imágenes adicionales como slides adicionales
            product.additionalImages.forEach((imgUrl, index) => {
                carouselItems += `
                    <div class="carousel-item">
                        <img src="${imgUrl}" class="d-block w-100" alt="${product.name} imagen ${index + 1}">
                    </div>
                `;
                
                carouselIndicators += `
                    <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index + 1}" 
                            aria-label="Slide ${index + 2}"></button>
                `;
            });
            
            // Armar el carrusel completo
            carouselHTML = `
                <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        ${carouselIndicators}
                    </div>
                    <div class="carousel-inner">
                        ${carouselItems}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Anterior</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Siguiente</span>
                    </button>
                </div>
            `;
        } else {
            // Solo imagen principal sin carrusel
            carouselHTML = `
                <div class="position-relative">
                    <img src="${product.mainImage || 'https://via.placeholder.com/150'}" 
                         class="card-img-top" alt="${product.name}" 
                         style="height: 180px; object-fit: cover;">
                    ${product.featured ? '<span class="position-absolute top-0 start-0 badge bg-warning m-2 featured-badge">Destacado</span>' : ''}
                </div>
            `;
        }
        
        // Contenido completo de la tarjeta
        card.innerHTML = `
            <div class="card h-100 product-card">
                ${carouselHTML}
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text small">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                    <p class="card-text">
                        <span class="price-tag mb-2">$${product.price.toLocaleString()}</span>
                        <br>
                        <strong>Stock:</strong> ${product.stock}
                        <br>
                        <strong>Categoría:</strong> ${product.category}
                    </p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productListElement.appendChild(card);
    });
    
    console.log(`Mostrando ${filteredProducts.length} productos`);
}

// Actualizar opciones de categorías en select
function updateCategoryOptions() {
    console.log('Actualizando opciones de categorías. Categorías disponibles:', categories);
    
    // Actualizar select de categoría en formulario
    const categorySelect = document.querySelector('select[name="category"]');
    const selectedCategory = categorySelect.value;
    categorySelect.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // Mantener selección anterior si existe
    if (selectedCategory) {
        categorySelect.value = selectedCategory;
    }
    
    // Actualizar filtro de categorías
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedFilter = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">Ver todas las categorías</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
    
    // Mantener filtro anterior si existe
    if (selectedFilter) {
        categoryFilter.value = selectedFilter;
    }
    
    console.log('Opciones de categorías actualizadas');
}

// Actualizar lista de categorías
function updateCategoryList() {
    console.log('Actualizando lista de categorías');
    const categoryListElement = document.getElementById('categoryList');
    categoryListElement.innerHTML = '';
    
    if (categories.length === 0) {
        categoryListElement.innerHTML = `
            <li class="list-group-item text-center text-muted py-3">
                No hay categorías disponibles
            </li>
        `;
        return;
    }
    
    categories.forEach(category => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${category.name}</span>
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        categoryListElement.appendChild(item);
    });
    
    console.log(`Se muestran ${categories.length} categorías`);
}