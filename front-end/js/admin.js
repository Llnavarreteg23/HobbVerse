const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

let products = [];
let categories = [];
let editingCategoryId = null;
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('searchProducts').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Cargar datos iniciales del JSON si no hay datos en localStorage
    if (products.length === 0 && categories.length === 0) {
        fetch('/front-end/data/initial-data.json')
            .then(response => response.json())
            .then(data => {
                products = data.products || [];
                categories = data.categories || [];
                updateUI();
                saveToLocalStorage();
            })
            .catch(error => console.error('Error loading initial data:', error));
    }
});

function loadStoredData() {
    // Cargar datos de localStorage
    const storedProducts = localStorage.getItem('products');
    const storedCategories = localStorage.getItem('categories');
    
    products = storedProducts ? JSON.parse(storedProducts) : [];
    categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    updateUI();
}

function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('categories', JSON.stringify(categories));
}

function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        img: formData.get('img'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };

    if (editingProductId) {
        // Editar producto existente
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
        editingProductId = null;
    } else {
        // Agregar nuevo producto
        products.push({
            id: Date.now(),
            ...productData
        });
    }

    saveToLocalStorage();
    updateUI();
    e.target.reset();
    e.target.querySelector('button[type="submit"]').textContent = 'Agregar Producto';
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryName = formData.get('categoryName');

    if (editingCategoryId) {
        // Editar categoría existente
        const index = categories.findIndex(c => c.id === editingCategoryId);
        if (index !== -1) {
            categories[index].name = categoryName;
        }
        editingCategoryId = null;
    } else {
        // Agregar nueva categoría
        categories.push({
            id: Date.now(),
            name: categoryName
        });
    }

    saveToLocalStorage();
    updateUI();
    e.target.reset();
    document.querySelector('#categoryForm button[type="submit"]').textContent = 'Guardar';
    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
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
// Filtrado de productos por nombre y categoría
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
                <img src="${product.img}" class="card-img-top" alt="${product.name}"
                     onerror="this.src='/Imagenes/placeholder.png'">
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
                        <span class="price-tag">${formatter.format(product.price)}</span>
                        <span class="badge bg-${product.stock > 0 ? 'success' : 'danger'}">
                            Stock: ${product.stock}
                        </span>
                    </div>
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

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    const form = document.getElementById('productForm');
    form.querySelector('[name="name"]').value = product.name;
    form.querySelector('[name="category"]').value = product.category;
    form.querySelector('[name="img"]').value = product.img;
    form.querySelector('[name="description"]').value = product.description;
    form.querySelector('[name="price"]').value = product.price;
    form.querySelector('[name="stock"]').value = product.stock;
    form.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
}
// Eliminar producto
function deleteProduct(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    products = products.filter(p => p.id !== id);
    saveToLocalStorage();
    updateUI();
}
// Editar categorias
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    editingCategoryId = id;
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    document.querySelector('#categoryForm input[name="categoryName"]').value = category.name;
    document.querySelector('#categoryForm button[type="submit"]').textContent = 'Actualizar';
    modal.show();
}
// Eliminar categoria
function deleteCategory(id) {
    if (!confirm('¿Está seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;

    categories = categories.filter(c => c.id !== id);
    // Actualizar productos que tenían esta categoría
    products = products.map(p => {
        if (p.category === id) {
            return { ...p, category: null };
        }
        return p;
    });

    saveToLocalStorage();
    updateUI();
}