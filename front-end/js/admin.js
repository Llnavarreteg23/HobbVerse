const defaultCategories = [
    { id: 1, name: "Lectura" },
    { id: 2, name: "Deportes" },
    { id: 3, name: "Música" },
    { id: 4, name: "Pintura" },
    { id: 5, name: "Videojuegos" },
    { id: 6, name: "Peliculas" },
    { id: 7, name: "Crochet" }
];

let categories = [...defaultCategories];
let products = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function () {
    loadCategories(); // Cargar categorías desde el frontend
    loadProducts(); // Cargar productos desde el backend
    setupCategoryForm(); // Configurar formulario de categorías
    setupProductForm(); // Configurar formulario de productos
});

// --- Manejo de Categorías ---
function loadCategories() {
    updateCategoryList();
    updateCategorySelect();
}

export function setupCategoryForm() {
    const categoryForm = document.getElementById('categoryForm');
    if (!categoryForm) {
        console.warn('Formulario de categorías no encontrado.');
        return;
    }

    categoryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const categoryName = e.target.elements['categoryName'].value.trim();

        if (!categoryName) {
            alert('El nombre de la categoría no puede estar vacío.');
            return;
        }

        categories.push({ id: Date.now(), name: categoryName });
        updateCategoryList();
        updateCategorySelect();
        e.target.reset();
        console.log('Nueva categoría agregada:', categoryName);
    });
}

function updateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) {
        console.warn('Contenedor de categorías no encontrado.');
        return;
    }

    categoryList.innerHTML = categories.map(category => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${category.name}
            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                <i class="bi bi-trash"></i>
            </button>
        </li>
    `).join('');
}

export function updateCategorySelect() {
    const categorySelects = document.querySelectorAll('select[name="category"], #categoryFilter');
    if (!categorySelects.length) {
        console.warn('No se encontraron selectores de categorías.');
        return;
    }

    const options = `
        ${document.querySelector('#categoryFilter') ? '<option value="">Ver todas las categorías</option>' : ''}
        ${categories.map(category =>
            `<option value="${category.name}">${category.name}</option>`
        ).join('')}
    `;

    categorySelects.forEach(select => {
        select.innerHTML = options;
    });
}

function deleteCategory(categoryId) {
    categories = categories.filter(category => category.id !== categoryId);
    updateCategoryList();
    updateCategorySelect();
    console.log('Categoría eliminada:', categoryId);
}

// --- Manejo de Productos ---
function loadProducts() {
    apiFetch(API_PRODUCT_BASE_URL, '')
        .then(data => {
            products = data;
            updateProductList();
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}

export function setupProductForm() {
    const productForm = document.getElementById('productForm');
    if (!productForm) {
        console.warn('Formulario de productos no encontrado.');
        return;
    }

    productForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const productData = {
            id: editingProductId || Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            img: formData.get('img'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            featured: formData.get('featured') === 'on'
        };

        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            products.push(productData);
        }

        updateProductList();
        e.target.reset();
        editingProductId = null;
        console.log('Producto guardado:', productData);
    });
}

function updateProductList() {
    const productList = document.getElementById('productList');
    if (!productList) {
        console.warn('Contenedor de productos no encontrado.');
        return;
    }

    if (products.length === 0) {
        productList.innerHTML = '<div class="text-center text-muted">No hay productos disponibles.</div>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="card">
            <img src="${product.img}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"><strong>Precio:</strong> $${product.price.toLocaleString()}</p>
                <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const productForm = document.getElementById('productForm');
    productForm.elements['name'].value = product.name;
    productForm.elements['category'].value = product.category;
    productForm.elements['img'].value = product.img;
    productForm.elements['description'].value = product.description;
    productForm.elements['price'].value = product.price;
    productForm.elements['stock'].value = product.stock;
    productForm.elements['featured'].checked = product.featured;

    editingProductId = productId;
}

function deleteProduct(productId) {
    products = products.filter(product => product.id !== productId);
    updateProductList();
    console.log('Producto eliminado:', productId);
}

// --- Función de Utilidad para la API ---
export async function apiFetch(baseUrl, endpoint, options = {}) {
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la API');
        }

        return response.json();
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
}