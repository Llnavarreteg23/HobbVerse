class FloatingCart {
    constructor() {
        // Constantes para claves de localStorage
        this.STORAGE_KEYS = {
            cart: 'cart',
            oldCart: 'carrito', // Clave usada en indexproductos.js
            products: 'hobbverse_products',
            newProducts: 'productos'
        };
        
        // Intentar cargar carrito desde ambas fuentes y sincronizarlos
        this.syncCarts();
        this.init();
    }

    init() {
        // Verificar si el componente ya existe antes de cargarlo
        if (!document.getElementById('floating-cart')) {
            this.loadCartComponent();
        }
        this.updateCartCount();
        this.setupButtonListeners();
        
        // Escuchar cambios en localStorage de otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEYS.cart || e.key === this.STORAGE_KEYS.oldCart) {
                console.log('Cambio detectado en carrito desde otra pestaña');
                this.syncCarts();
                this.updateCartCount();
                this.renderCartItems();
            }
        });
        
        // Escuchar eventos personalizados de carritoActualizado
        document.addEventListener('carritoActualizado', (e) => {
            console.log('Evento carritoActualizado detectado');
            this.syncCarts();
            this.updateCartCount();
            this.renderCartItems();
        });
    }
    
    // Sincronizar ambos carritos para mantener coherencia
    syncCarts() {
        try {
            // Cargar ambos carritos
            const newCartJSON = localStorage.getItem(this.STORAGE_KEYS.cart);
            const oldCartJSON = localStorage.getItem(this.STORAGE_KEYS.oldCart);
            
            let mergedCart = [];
            
            // Procesar carrito nuevo formato si existe
            if (newCartJSON) {
                mergedCart = JSON.parse(newCartJSON);
                console.log('Carrito cargado (nuevo formato):', mergedCart);
            }
            
            // Procesar carrito antiguo formato si existe
            if (oldCartJSON) {
                const oldCart = JSON.parse(oldCartJSON);
                console.log('Carrito cargado (formato antiguo):', oldCart);
                
                // Por cada item en el carrito antiguo
                oldCart.forEach(oldItem => {
                    // Buscar si ya existe en el carrito unificado
                    const existingItem = mergedCart.find(item => item.id == oldItem.productoId || 
                                                           item.id == oldItem.id);
                    
                    if (existingItem) {
                        // Si existe, actualizar cantidad (usar la mayor)
                        existingItem.quantity = Math.max(existingItem.quantity, oldItem.cantidad || oldItem.quantity || 0);
                    } else {
                        // Si no existe, agregar como nuevo item
                        mergedCart.push({
                            id: oldItem.productoId || oldItem.id,
                            name: oldItem.nombre || oldItem.name,
                            price: parseFloat(oldItem.precio || oldItem.price),
                            mainImage: oldItem.imagen || oldItem.mainImage || '',
                            category: oldItem.categoria || oldItem.category || '',
                            quantity: oldItem.cantidad || oldItem.quantity || 1
                        });
                    }
                });
            }
            
            // Guardar carrito unificado
            this.cart = mergedCart;
            this.saveCart(true); // true para guardar en ambos formatos
            
            return mergedCart;
        } catch (error) {
            console.error('Error al sincronizar carritos:', error);
            // En caso de error, usar un carrito vacío
            this.cart = [];
            return [];
        }
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
                        // Obtener datos del producto desde todas las fuentes posibles
                        const productosNuevos = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.newProducts) || '[]');
                        const productosAntiguos = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.products) || '[]');
                        
                        const allProducts = [...productosNuevos, ...productosAntiguos];
                        const product = allProducts.find(p => p.id == productId);
                        
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
                    <span class="cart-count" id="carrito-contador">0</span>
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

        // Normalizar producto para manejar ambos formatos
        const normalizedProduct = {
            id: product.id,
            name: product.name || product.nombre || product.nombreProducto || '',
            price: parseFloat(product.price || product.precio || 0),
            mainImage: product.mainImage || product.imagen || '',
            category: product.category || product.categoria || '',
            quantity: 1
        };

        console.log('Agregando producto normalizado al carrito:', normalizedProduct);

        const existingItem = this.cart.find(item => item.id == normalizedProduct.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Incrementada cantidad de producto existente:', existingItem);
        } else {
            this.cart.push(normalizedProduct);
            console.log('Añadido nuevo producto al carrito');
        }

        this.saveCart(true); // true para guardar en ambos formatos
        this.updateCartCount();
        this.renderCartItems();
        this.showAddedToCartMessage(normalizedProduct.name);
        
        // Disparar evento personalizado
        const event = new CustomEvent('carritoActualizado', { 
            detail: { carrito: this.cart } 
        });
        document.dispatchEvent(event);
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

        // Animar entrada
        setTimeout(() => {
            message.classList.add('cart-message-active');
        }, 10);

        setTimeout(() => {
            message.classList.remove('cart-message-active');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        // Actualizar todos los posibles contadores
        const countElements = document.querySelectorAll('.cart-count, #carrito-contador, .carrito-contador, [data-carrito-contador]');
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
                <img src="${item.mainImage || 'https://via.placeholder.com/50x50?text=Imagen'}" alt="${item.name}" class="cart-item-image">
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

        const item = this.cart.find(item => item.id == productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart(true);
            this.updateCartCount();
            this.renderCartItems();
            
            // Disparar evento personalizado
            const event = new CustomEvent('carritoActualizado', { 
                detail: { carrito: this.cart } 
            });
            document.dispatchEvent(event);
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id != productId);
        this.saveCart(true);
        this.updateCartCount();
        this.renderCartItems();
        
        // Disparar evento personalizado
        const event = new CustomEvent('carritoActualizado', { 
            detail: { carrito: this.cart } 
        });
        document.dispatchEvent(event);
    }

    saveCart(syncBothFormats = false) {
        // Guardar en formato nuevo
        localStorage.setItem(this.STORAGE_KEYS.cart, JSON.stringify(this.cart));
        
        // Si se indica, guardar también en formato antiguo para compatibilidad
        if (syncBothFormats) {
            const oldFormatCart = this.cart.map(item => ({
                productoId: item.id,
                nombre: item.name,
                precio: item.price,
                imagen: item.mainImage,
                cantidad: item.quantity
            }));
            
            localStorage.setItem(this.STORAGE_KEYS.oldCart, JSON.stringify(oldFormatCart));
        }
    }
}

// Inicializar carrito globalmente cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    window.floatingCart = new FloatingCart();
    
    // Función global de agregar al carrito para compatibilidad con botones existentes
    window.agregarAlCarrito = function(productoId) {
        // Buscar producto en todas las fuentes posibles
        const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
        const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
        const allProducts = [...productosNuevos, ...productosAntiguos];
        
        // Buscar por ID como string o número
        const product = allProducts.find(p => p.id == productoId);
        
        if (product && window.floatingCart) {
            window.floatingCart.addToCart(product);
            return true;
        } else {
            console.error('Producto no encontrado o carrito no inicializado:', productoId);
            return false;
        }
    };
});

// Inicializar carrito si ya se ha cargado el DOM
if (document.readyState !== 'loading') {
    if (!window.floatingCart) {
        window.floatingCart = new FloatingCart();
    }
    
    // Función global de agregar al carrito
    if (!window.agregarAlCarrito) {
        window.agregarAlCarrito = function(productoId) {
            const productosNuevos = JSON.parse(localStorage.getItem('productos') || '[]');
            const productosAntiguos = JSON.parse(localStorage.getItem('hobbverse_products') || '[]');
            const allProducts = [...productosNuevos, ...productosAntiguos];
            const product = allProducts.find(p => p.id == productoId);
            
            if (product && window.floatingCart) {
                window.floatingCart.addToCart(product);
                return true;
            } else {
                console.error('Producto no encontrado o carrito no inicializado:', productoId);
                return false;
            }
        };
    }
}

