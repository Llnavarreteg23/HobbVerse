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

let products = [];
let categories = [...defaultCategories];
let editingProductId = null;

// Variables para manejo de imágenes
let currentMainImageUrl = '';
let currentAdditionalImageUrls = [];

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    setupEventListeners();
    initImageUpload();
    setupFilters();
    setupCategoryForm();
});

// --- Funciones de Utilidad de la API ---
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

// --- Manejo de Categorías ---
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
        updateCategorySelect();
        e.target.reset();
        console.log('Nueva categoría agregada:', categoryName);
    });
}

export function updateCategorySelect() {
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

// --- Manejo de Productos ---
export async function loadData() {
    try {
        products = await apiFetch(API_PRODUCT_BASE_URL, '');
        console.log('Todos los productos cargados desde el backend:', products);

        categories = [...defaultCategories];
        updateCategorySelect();
        updateUI();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos. Intenta nuevamente.');
    }
}

export async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
        nombreProducto: formData.get('name'),
        cantidad: parseInt(formData.get('stock')),
        precio: parseFloat(formData.get('price')),
        categoria: formData.get('category'),
        descripcion: formData.get('description'),
    };

    if (!productData.nombreProducto || !productData.cantidad || !productData.precio || !productData.categoria || !productData.descripcion) {
        alert('Todos los campos obligatorios deben ser llenados.');
        return;
    }

    try {
        let createdOrUpdatedProduct;

        if (editingProductId) {
            createdOrUpdatedProduct = await apiFetch(API_PRODUCT_BASE_URL, `/${editingProductId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } else {
            createdOrUpdatedProduct = await apiFetch(API_PRODUCT_BASE_URL, '', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        }

        if (createdOrUpdatedProduct) {
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
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        alert('Error al guardar el producto.');
    }
}

export async function deleteProduct(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await apiFetch(API_PRODUCT_BASE_URL, `/${productId}`, { method: 'DELETE' });
            products = products.filter(p => p.idProducto !== productId);
            updateUI();
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            alert('Error al eliminar el producto.');
        }
    }
}

export function updateUI() {
    updateProductList();
    updateCategorySelect();
}

export function updateProductList() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    if (products.length === 0) {
        productList.innerHTML = '<div class="text-center text-muted">No hay productos disponibles.</div>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="card">
            <h5>${product.nombreProducto}</h5>
            <p>${product.descripcion}</p>
            <p>${formatter.format(product.precio)}</p>
            <button onclick="editProduct(${product.idProducto})">Editar</button>
            <button onclick="deleteProduct(${product.idProducto})">Eliminar</button>
        </div>
    `).join('');
}