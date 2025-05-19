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
        
        const storedProducts = localStorage.getItem('hobbverse_products');
        const storedCategories = localStorage.getItem('hobbverse_categories');

        if (storedProducts) {
            products = JSON.parse(storedProducts);
        }

        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            
            const response = await fetch('/front-end/data/initial-data.json');
            const data = await response.json();
            categories = data.categories;
            localStorage.setItem('hobbverse_categories', JSON.stringify(categories));
        }
    } catch (error) {
        console.error('Error loading data:', error);
        
        categories = [
            { id: 1, name: "Deportes" },
            { id: 2, name: "Arte" },
            { id: 3, name: "Música" }
        ];
    }

    updateUI();
}

function saveData() {
    try {
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
    
    const producto = {
        id: Date.now().toString(),
        name: formData.get('name'),
        mainImage: formData.get('mainImage'),
        additionalImages: Array.from(document.querySelectorAll('[name^="additionalImage"]'))
            .map(input => input.value)
            .filter(url => url),
        description: formData.get('description'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        featured: formData.get('featured') === 'on'  // Aseguramos que sea booleano
    };

    // Obtener productos existentes
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    productos.push(producto);
    
    // Guardar en localStorage
    localStorage.setItem('productos', JSON.stringify(productos));
    
    console.log('Producto guardado:', producto);
    
    // Actualizar UI
    updateProductList();
    e.target.reset();
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
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    updateProductList(filteredProducts);
    document.getElementById('productCount').textContent = filteredProducts.length;
}

function updateProductList(productsToShow = products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = productsToShow.map(product => `
        <div class="col">
            <div class="card product-card h-100">
                <!-- Carrusel de imágenes -->
                <div id="carousel-${product.id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        <button type="button" data-bs-target="#carousel-${product.id}" data-bs-slide-to="0" class="active"></button>
                        ${product.additionalImages.map((_, index) => `
                            <button type="button" data-bs-target="#carousel-${product.id}" data-bs-slide-to="${index + 1}"></button>
                        `).join('')}
                    </div>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src="${product.mainImage}" class="d-block w-100" alt="${product.name}"
                                 onerror="this.src='/Imagenes/placeholder.png'">
                        </div>
                        ${product.additionalImages.map(img => `
                            <div class="carousel-item">
                                <img src="${img}" class="d-block w-100" alt="${product.name}"
                                     onerror="this.src='/Imagenes/placeholder.png'">
                            </div>
                        `).join('')}
                    </div>
                    ${(product.additionalImages.length > 0) ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${product.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                            <span class="visually-hidden">Anterior</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${product.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    ` : ''}
                </div>

                <!-- Botones de acción -->
                <div class="product-actions">
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <span class="badge bg-secondary mb-2">${product.category || 'Sin categoría'}</span>
                    <p class="card-text">${product.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="price-tag">${new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                        }).format(product.price)}</span>
                        <span class="badge bg-${product.stock > 0 ? 'success' : 'danger'}">
                            Stock: ${product.stock}
                        </span>
                    </div>
                    ${product.featured ? `
                        <div class="featured-badge">
                            <i class="bi bi-star-fill"></i> Destacado
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const form = document.getElementById('productForm');
    form.elements['name'].value = product.name;
    form.elements['mainImage'].value = product.mainImage;
    form.elements['description'].value = product.description;
    form.elements['category'].value = product.category;
    form.elements['price'].value = product.price;
    form.elements['stock'].value = product.stock;
    form.elements['featured'].checked = product.featured;

    const additionalImagesContainer = document.getElementById('additionalImages');
    additionalImagesContainer.innerHTML = '';
    imageCount = 0;

    product.additionalImages.forEach(imgUrl => {
        imageCount++;
        const container = document.createElement('div');
        container.className = 'additional-image';
        container.innerHTML = `
            <label class="form-label small text-muted">Imagen adicional ${imageCount}</label>
            <div class="d-flex gap-2">
                <input type="url" class="form-control" name="additionalImage${imageCount}" 
                       placeholder="URL de la imagen adicional" value="${imgUrl}">
                <button type="button" class="remove-image" title="Eliminar imagen">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;

        container.querySelector('.remove-image').addEventListener('click', function () {
            container.remove();
        });

        additionalImagesContainer.appendChild(container);
    });

    editingProductId = productId;
    form.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';
    form.scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    products = products.filter(p => p.id !== id);
    saveData();
    updateUI();
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