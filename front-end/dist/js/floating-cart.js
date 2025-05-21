class FloatingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }

    init() {
        // Verificar si el componente ya existe antes de cargarlo
        if (!document.getElementById('floating-cart')) {
            this.loadCartComponent();
        }
        this.updateCartCount();
        this.setupButtonListeners();
    }

    setupButtonListeners() {
        // Delegar eventos para botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.buy-button')) {
                const productCard = e.target.closest('.producto-card');
                if (productCard) {
                    // Intentar obtener el ID del producto desde el dataset o desde la función onclick
                    const productId = productCard.dataset.productId || this.extractProductIdFromClick(e.target);
                    
                    if (productId) {
                        // Obtener datos del producto desde localStorage
                        const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
                        const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
                        
                        
                        const allProducts = [...productosNuevos, ...productosAntiguos];
                        const product = allProducts.find(p => p.id === productId);
                        
                        if (product) {
                            this.addToCart(product);
                        }
                    }
                }
            }
        });
    }

    // Extraer ID del producto cuando viene desde un atributo onclick
    extractProductIdFromClick(element) {
        const onclickAttr = element.getAttribute('onclick') || '';
        const matches = onclickAttr.match(/['"](.*?)['"]/);
        return matches && matches.length > 1 ? matches[1] : null;
    }

    async loadCartComponent() {
        const cartHtml = `
            <div id="floating-cart" class="floating-cart">
                <button class="cart-toggle" id="cartToggle">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </button>
                
                <div class="cart-content">
                    <div class="cart-header">
                        <h5>Carrito de Compras</h5>
                        <button class="close-cart" id="closeCart">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cart-items" id="cartItems"></div>
                    
                    <div class="cart-footer">
                        <div class="cart-total">
                            <span>Total:</span>
                            <span id="cartTotal">$0</span>
                        </div>
                        <a href="/front-end/html/carrito.html" class="btn btn-primary w-100">
                            Ver Carrito
                        </a>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', cartHtml);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('cartToggle')?.addEventListener('click', () => {
            document.querySelector('.cart-content')?.classList.toggle('active');
            this.renderCartItems();
        });

        document.getElementById('closeCart')?.addEventListener('click', () => {
            document.querySelector('.cart-content')?.classList.remove('active');
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-cart')) {
                document.querySelector('.cart-content')?.classList.remove('active');
            }
        });
    }

    addToCart(product) {
        if (!product || !product.id) {
            console.error('Producto inválido:', product);
            return;
        }

        
        const normalizedProduct = {
            id: product.id,
            name: product.name || product.nombre,
            price: parseFloat(product.price || product.precio),
            mainImage: product.mainImage || product.imagen,
            category: product.category || '',
            quantity: 1
        };

        const existingItem = this.cart.find(item => item.id === normalizedProduct.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(normalizedProduct);
        }

        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.showAddedToCartMessage(normalizedProduct.name);
        
        
        this.syncWithOldCart(normalizedProduct);
    }

    
    syncWithOldCart(product) {
        const oldCart = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
        
        const existingItem = oldCart.find(item => item.productoId === product.id);
        
        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            oldCart.push({
                productoId: product.id,
                nombre: product.name,
                precio: product.price,
                imagen: product.mainImage,
                cantidad: 1
            });
        }
        
        localStorage.setItem('hobbverse_carrito', JSON.stringify(oldCart));
    }

    showAddedToCartMessage(productName) {
        const oldMessage = document.querySelector('.cart-message');
        if (oldMessage) oldMessage.remove();

        const message = document.createElement('div');
        message.className = 'cart-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>${productName}</strong>
                <br>
                ¡Agregado al carrito!
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => message.remove(), 2000);
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const countElements = document.querySelectorAll('.cart-count');
        countElements.forEach(element => {
            element.textContent = count.toString();
            element.classList.add('cart-count-update');
            setTimeout(() => element.classList.remove('cart-count-update'), 300);
        });
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-muted my-3">El carrito está vacío</p>';
            document.getElementById('cartTotal').textContent = '$0';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.mainImage}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h6 class="cart-item-title">${item.name}</h6>
                    <div class="cart-item-category">${item.category}</div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="window.floatingCart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="window.floatingCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-item" onclick="window.floatingCart.removeItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartTotal').textContent = `$${total.toLocaleString()}`;
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            
            
            this.syncCartQuantity(productId, newQuantity);
        }
    }
    
    syncCartQuantity(productId, newQuantity) {
        const oldCart = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
        const item = oldCart.find(item => item.productoId === productId);
        
        if (item) {
            item.cantidad = newQuantity;
            localStorage.setItem('hobbverse_carrito', JSON.stringify(oldCart));
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        
        
        this.removeFromOldCart(productId);
    }
    
    removeFromOldCart(productId) {
        const oldCart = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
        const updatedCart = oldCart.filter(item => item.productoId !== productId);
        localStorage.setItem('hobbverse_carrito', JSON.stringify(updatedCart));
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
}

// Inicializar carrito globalmente cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    window.floatingCart = new FloatingCart();
    
    
    window.agregarAlCarrito = function(productoId) {
        const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
        const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
        const allProducts = [...productosNuevos, ...productosAntiguos];
        const product = allProducts.find(p => p.id == productoId);
        
        if (product && window.floatingCart) {
            window.floatingCart.addToCart(product);
        }
    };
});

// Inicializar carrito si ya se ha cargado el DOM
if (document.readyState !== 'loading') {
    window.floatingCart = window.floatingCart || new FloatingCart();
    
    
    window.agregarAlCarrito = function(productoId) {
        const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
        const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
        const allProducts = [...productosNuevos, ...productosAntiguos];
        const product = allProducts.find(p => p.id == productoId);
        
        if (product && window.floatingCart) {
            window.floatingCart.addToCart(product);
        }
    };
}