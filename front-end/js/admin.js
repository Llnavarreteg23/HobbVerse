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

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos
    loadData();
    setupEventListeners();
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
        // Unificar productos de ambas fuentes
        const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
        const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
        
        // Combinar y eliminar duplicados
        products = [...productosNuevos, ...productosAntiguos].reduce((acc, producto) => {
            // Verificar si ya existe un producto con el mismo ID
            const existingIndex = acc.findIndex(p => p.id === producto.id);
            
            
            if (existingIndex >= 0) {
                
                const isFromProductos = productosNuevos.some(p => p.id === producto.id);
                if (isFromProductos) {
                    acc[existingIndex] = producto;
                }
                return acc;
            }
            
            // Normalizar formato
            acc.push({
                id: producto.id || Date.now().toString(),
                name: producto.name || producto.nombre || '',
                category: producto.category || '',
                description: producto.description || '',
                price: parseFloat(producto.price || producto.precio || 0),
                stock: parseInt(producto.stock || 0),
                mainImage: producto.mainImage || producto.imagen || '',
                additionalImages: producto.additionalImages || [],
                featured: producto.featured || false
            });
            return acc;
        }, []);
        
       
        localStorage.setItem('productos', JSON.stringify(products));
        
        // Cargar categorías
        const storedCategories = localStorage.getItem('hobbverse_categories');

        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            try {
                const response = await fetch('/front-end/data/initial-data.json');
                const data = await response.json();
                categories = data.categories;
            } catch (fetchError) {
                console.error('Error fetching initial data:', fetchError);
                categories = [
                    { id: 1, name: "Deportes" },
                    { id: 2, name: "Arte" },
                    { id: 3, name: "Música" }
                ];
            }
            localStorage.setItem('hobbverse_categories', JSON.stringify(categories));
        }
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Valores por defecto
        if (!products || !Array.isArray(products)) {
            products = [];
        }
        
        if (!categories || !Array.isArray(categories)) {
            categories = [
                { id: 1, name: "Deportes" },
                { id: 2, name: "Arte" },
                { id: 3, name: "Música" }
            ];
        }
    }

    updateUI();
}

function saveData() {
    try {
        
        localStorage.setItem('productos', JSON.stringify(products));
        localStorage.setItem('hobbverse_products', JSON.stringify(products));
        localStorage.setItem('hobbverse_categories', JSON.stringify(categories));
    } catch (error) {
        console.error('Error saving data:', error);
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

function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const productData = {
        id: editingProductId || Date.now().toString(),
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

    if (editingProductId) {
        // Actualizar en la variable products
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = productData;
        } else {
            // Si no se encuentra, agregarlo
            products.push(productData);
        }
    } else {
        // Agregar nuevo producto
        products.push(productData);
    }
    
    // Guardar en localStorage (ambos)
    saveData();
    
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
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryName = formData.get('categoryName').trim();

    if (editingCategoryId) {
        const index = categories.findIndex(cat => cat.id === editingCategoryId);
        if (index !== -1) {
            categories[index].name = categoryName;
        }
        editingCategoryId = null;
        e.target.querySelector('button[type="submit"]').textContent = 'Agregar Categoría';
    } else {
        const newCategory = {
            id: Date.now(),
            name: categoryName
        };
        categories.push(newCategory);
    }
    saveData();
    updateUI();

    e.target.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    if (modal) modal.hide();
}

function updateUI() {
    updateCategoryList();
    updateProductList();
    updateCategorySelect();
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
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || 
                              (product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());
        return matchesSearch && matchesCategory;
    });
    
    updateProductList(filteredProducts);
}

function updateProductList(filteredProducts = null) {
    const productList = document.getElementById('productList');
    const productsToDisplay = filteredProducts || products;
    
    if (!productList) return;

    if (productsToDisplay.length === 0) {
        productList.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay productos registrados</p>
            </div>
        `;
        return;
    }

    productList.innerHTML = productsToDisplay.map(producto => `
        <div class="col">
            <div class="card h-100 ${producto.featured ? 'border-warning' : ''}">
                <div class="position-relative">
                    <img src="${producto.mainImage}" class="card-img-top" alt="${producto.name}" 
                         style="height: 200px; object-fit: contain;">
                    ${producto.featured ? 
                        '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Destacado</span>' 
                        : ''}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${producto.name}</h5>
                    <p class="card-text small">${producto.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary">${producto.category || 'Sin categoría'}</span>
                        <span class="text-success fw-bold">$${producto.price.toLocaleString()}</span>
                    </div>
                    <div class="btn-group w-100">
                        <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${producto.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${producto.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="toggleFeatured('${producto.id}')">
                            <i class="bi bi-star${producto.featured ? '-fill' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleFeatured(productId) {
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index].featured = !products[index].featured;
        saveData(); 
        updateProductList();
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

function editProduct(productId) {
    
    let producto = products.find(p => p.id === productId);
    
    if (!producto) {
        
        try {
            const productosAlmacenados = localStorage.getItem('productos');
            if (productosAlmacenados) {
                const productosArray = JSON.parse(productosAlmacenados);
                producto = productosArray.find(p => p.id === productId);
                
                
                if (producto && !products.some(p => p.id === productId)) {
                    products.push(producto);
                    saveData();
                }
            }
            
           
            if (!producto) {
                const hobbverseProductos = localStorage.getItem('hobbverse_products');
                if (hobbverseProductos) {
                    const hobbverseArray = JSON.parse(hobbverseProductos);
                    producto = hobbverseArray.find(p => p.id === productId);
                    
                    
                    if (producto && !products.some(p => p.id === productId)) {
                        products.push(producto);
                        saveData();
                    }
                }
            }
        } catch (error) {
            console.error('Error buscando producto:', error);
        }
    }
    
    if (!producto) {
        console.error('Producto no encontrado:', productId);
        return;
    }

    const form = document.getElementById('productForm');
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    
    // Llenar el formulario con los datos del producto
    form.elements['name'].value = producto.name || producto.nombre || '';
    form.elements['category'].value = producto.category || '';
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
    editingProductId = productId;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Actualizar Producto';
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        saveData(); 
        updateProductList();
    }
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    editingCategoryId = id;
    const form = document.getElementById('categoryForm');
    form.elements['categoryName'].value = category.name;

    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();

    form.querySelector('button[type="submit"]').textContent = 'Actualizar Categoría';
}

function deleteCategory(id) {
    if (!confirm('¿Está seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;

    categories = categories.filter(c => c.id !== id);

    products = products.map(p => {
        if (p.category === id) {
            return { ...p, category: null };
        }
        return p;
    });

    saveData();
    updateUI();
}