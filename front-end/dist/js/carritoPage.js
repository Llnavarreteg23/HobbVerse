class CarritoPage {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.cupones = {
            'DESCUENTO10': { descripcion: '10% de descuento', valor: 0.1, tipo: 'porcentaje' },
            'ENVIOGRATIS': { descripcion: 'Envío gratis', valor: 5000, tipo: 'fijo' },
            'HOBBVERSE25': { descripcion: '25% de descuento', valor: 0.25, tipo: 'porcentaje' }
        };
        this.cuponAplicado = null;
        this.costoEnvio = 5000;
        
        this.init();
    }

    init() {
        this.loadCartItems();
        this.setupEventListeners();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        // Botón para continuar comprando
        const continuarComprando = document.querySelector('a[href="index.html"]');
        if (continuarComprando) {
            continuarComprando.addEventListener('click', (e) => {
                
                e.currentTarget.href = window.location.pathname.includes('/front-end/') 
                    ? '/front-end/html/index.html' 
                    : 'index.html';
            });
        }

        // Botón para vaciar carrito
        const vaciarCarritoBtn = document.querySelector('.btn-outline-danger');
        if (vaciarCarritoBtn) {
            vaciarCarritoBtn.addEventListener('click', () => this.vaciarCarrito());
        }

        // Botón para aplicar cupón
        const aplicarCuponBtn = document.querySelector('.input-group button');
        if (aplicarCuponBtn) {
            aplicarCuponBtn.addEventListener('click', () => this.aplicarCupon());
        }

        // Botón para finalizar compra
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.finalizarCompra());
        }
    }

    loadCartItems() {
        const cartContainer = document.querySelector('.cart-container .card-body');
        const headerRow = cartContainer.querySelector('.d-none.d-md-flex');
        const buttonRow = cartContainer.querySelector('.d-flex.justify-content-between.mt-4');
        
        // Limpiar productos anteriores (mantener solo el header y los botones)
        const productCards = cartContainer.querySelectorAll('.product-card');
        productCards.forEach(card => card.remove());

        if (this.cart.length === 0) {
            // Mostrar mensaje de carrito vacío
            const emptyCartMessage = document.createElement('div');
            emptyCartMessage.className = 'text-center py-5';
            emptyCartMessage.innerHTML = `
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h3>Tu carrito está vacío</h3>
                <p class="text-muted">¡Añade algunos productos para comenzar!</p>
                <a href="index.html" class="btn btn-primary mt-3">
                    <i class="fas fa-store me-2"></i>Ir a la tienda
                </a>
            `;
            headerRow.after(emptyCartMessage);
            buttonRow.style.display = 'none';
            return;
        }

        // Mostrar productos del carrito
        this.cart.forEach(item => {
            const productCard = document.createElement('div');
            productCard.className = 'card product-card mb-3';
            productCard.dataset.productId = item.id;
            
            productCard.innerHTML = `
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <div class="d-flex align-items-center">
                                <div class="product-image-container me-3">
                                    <div class="product-image" style="background-image: url('${item.mainImage}')"></div>
                                </div>
                                <div class="product-details">
                                    <h3 class="product-title">${item.name}</h3>
                                    <small class="text-muted d-md-none">Precio: $${item.price.toLocaleString()}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2 text-md-center mb-2 mb-md-0">
                            <span class="d-inline d-md-none fw-bold">Precio: </span>
                            <span class="product-price">$${item.price.toLocaleString()}</span>
                        </div>
                        <div class="col-md-2 text-md-center mb-2 mb-md-0">
                            <div class="quantity-control d-flex align-items-center justify-content-md-center">
                                <button class="btn btn-sm btn-outline-secondary decrease-qty" data-product-id="${item.id}">-</button>
                                <input type="text" class="form-control mx-2 product-qty" value="${item.quantity}" data-product-id="${item.id}" style="width: 50px; text-align: center;">
                                <button class="btn btn-sm btn-outline-secondary increase-qty" data-product-id="${item.id}">+</button>
                            </div>
                        </div>
                        <div class="col-md-2 text-md-end">
                            <span class="d-inline d-md-none fw-bold">Subtotal: </span>
                            <span class="product-subtotal">$${(item.price * item.quantity).toLocaleString()}</span>
                            <div class="mt-2 text-end">
                                <button class="btn btn-sm text-danger remove-item" data-product-id="${item.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insertar entre el header y los botones
            if (buttonRow.previousElementSibling === headerRow) {
                headerRow.after(productCard);
            } else {
                buttonRow.before(productCard);
            }
        });
        
        // Mostrar nuevamente los botones si estaban ocultos
        buttonRow.style.display = 'flex';

        // Agregar event listeners para los botones de cantidad y eliminación
        this.setupProductEventListeners();
    }

    setupProductEventListeners() {
        // Botones para disminuir cantidad
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.updateProductQuantity(productId, -1);
            });
        });

        // Botones para aumentar cantidad
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.updateProductQuantity(productId, 1);
            });
        });

        // Inputs de cantidad
        document.querySelectorAll('.product-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const newQuantity = parseInt(e.currentTarget.value);
                
                if (isNaN(newQuantity) || newQuantity < 1) {
                    e.currentTarget.value = 1;
                    this.setProductQuantity(productId, 1);
                } else {
                    this.setProductQuantity(productId, newQuantity);
                }
            });
        });

        // Botones para eliminar producto
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.removeItem(productId);
            });
        });
    }

    updateProductQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) return; 
            
            this.setProductQuantity(productId, newQuantity);
        }
    }

    setProductQuantity(productId, quantity) {
        // Actualizar en el array local
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            
            // Actualizar input y subtotal en la interfaz
            const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (productCard) {
                const qtyInput = productCard.querySelector('.product-qty');
                const subtotalElement = productCard.querySelector('.product-subtotal');
                
                qtyInput.value = quantity;
                subtotalElement.textContent = `$${(item.price * quantity).toLocaleString()}`;
            }
            
            // Guardar cambios en localStorage
            this.saveCart();
            
            // Actualizar en el carrito flotante
            if (window.floatingCart) {
                window.floatingCart.updateQuantity(productId, quantity);
            } else {
                
                this.syncWithOldCart(productId, quantity);
            }
            
            // Actualizar totales
            this.updateOrderSummary();
        }
    }

    syncWithOldCart(productId, quantity) {
        const oldCart = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
        const item = oldCart.find(item => item.productoId === productId);
        
        if (item) {
            item.cantidad = quantity;
            localStorage.setItem('hobbverse_carrito', JSON.stringify(oldCart));
        }
    }

    removeItem(productId) {
        // Eliminar del array local
        this.cart = this.cart.filter(item => item.id !== productId);
        
        // Eliminar de la interfaz
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (productCard) {
            productCard.remove();
        }
        
        // Guardar cambios en localStorage
        this.saveCart();
        
        // Eliminar del carrito flotante si existe
        if (window.floatingCart) {
            window.floatingCart.removeItem(productId);
        } else {
            
            this.removeFromOldCart(productId);
        }
        
        // Verificar si el carrito quedó vacío
        if (this.cart.length === 0) {
            this.loadCartItems(); 
        }
        
        // Actualizar totales
        this.updateOrderSummary();
    }

    removeFromOldCart(productId) {
        const oldCart = JSON.parse(localStorage.getItem('hobbverse_carrito') || '[]');
        const updatedCart = oldCart.filter(item => item.productoId !== productId);
        localStorage.setItem('hobbverse_carrito', JSON.stringify(updatedCart));
    }

    vaciarCarrito() {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            // Vaciar array local
            this.cart = [];
            
            // Guardar cambios en localStorage
            this.saveCart();
            
            
            localStorage.setItem('hobbverse_carrito', '[]');
            
            // Sincronizar con carrito flotante
            if (window.floatingCart) {
                window.floatingCart.cart = [];
                window.floatingCart.saveCart();
                window.floatingCart.updateCartCount();
                window.floatingCart.renderCartItems();
            }
            
            // Recargar interfaz
            this.loadCartItems();
            this.updateOrderSummary();
        }
    }

    aplicarCupon() {
        const cuponInput = document.querySelector('.input-group input');
        const cuponCodigo = cuponInput.value.trim().toUpperCase();
        
        if (!cuponCodigo) {
            this.mostrarAlerta('Por favor ingresa un código de cupón', 'warning');
            return;
        }
        
        const cupon = this.cupones[cuponCodigo];
        
        if (!cupon) {
            this.mostrarAlerta('Cupón inválido o expirado', 'danger');
            return;
        }
        
        // Aplicar cupón
        this.cuponAplicado = {
            codigo: cuponCodigo,
            ...cupon
        };
        
        // Mostrar confirmación
        this.mostrarAlerta(`Cupón "${cuponCodigo}" aplicado: ${cupon.descripcion}`, 'success');
        
        // Actualizar resumen de la orden
        this.updateOrderSummary();
    }

    mostrarAlerta(mensaje, tipo) {
        // Remover alertas anteriores
        const alertasExistentes = document.querySelectorAll('.alert-cupon');
        alertasExistentes.forEach(alerta => alerta.remove());
        
        // Crear nueva alerta
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-cupon mt-2`;
        alerta.textContent = mensaje;
        
        
        const inputGroup = document.querySelector('.input-group');
        inputGroup.after(alerta);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

    updateOrderSummary() {
        // Calcular subtotal
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Descuento por cupón
        let descuento = 0;
        if (this.cuponAplicado) {
            if (this.cuponAplicado.tipo === 'porcentaje') {
                descuento = subtotal * this.cuponAplicado.valor;
            } else if (this.cuponAplicado.tipo === 'fijo') {
                descuento = this.cuponAplicado.valor;
            }
        }
        
        // Costo de envío (gratuito si se aplicó cupón de envío gratis)
        let envio = this.costoEnvio;
        if (this.cuponAplicado && this.cuponAplicado.codigo === 'ENVIOGRATIS') {
            envio = 0;
        }
        
        // Calcular total
        const total = subtotal - descuento + envio;
        
        // Actualizar interfaz
        const subtotalElement = document.querySelector('.order-summary .card-body div:nth-child(2) span:last-child');
        const envioElement = document.querySelector('.order-summary .card-body div:nth-child(3) span:last-child');
        const totalElement = document.querySelector('.total-amount');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
        if (envioElement) envioElement.textContent = envio === 0 ? 'Gratis' : `$${envio.toLocaleString()}`;
        if (totalElement) totalElement.textContent = `$${total.toLocaleString()}`;

        // Mostrar información de descuento si hay cupón aplicado y no es envío gratis
        const descuentoRow = document.querySelector('.descuento-row');
        
        if (this.cuponAplicado && this.cuponAplicado.codigo !== 'ENVIOGRATIS' && descuento > 0) {
            if (!descuentoRow) {
                // Crear fila de descuento si no existe
                const newDescuentoRow = document.createElement('div');
                newDescuentoRow.className = 'descuento-row d-flex justify-content-between mb-2 text-success';
                newDescuentoRow.innerHTML = `
                    <span>Descuento (${this.cuponAplicado.codigo}):</span>
                    <span>-$${descuento.toLocaleString()}</span>
                `;
                // Insertar después del envío
                envioElement.closest('div').after(newDescuentoRow);
            } else {
                // Actualizar fila existente
                descuentoRow.innerHTML = `
                    <span>Descuento (${this.cuponAplicado.codigo}):</span>
                    <span>-$${descuento.toLocaleString()}</span>
                `;
            }
        } else if (descuentoRow) {
            // Eliminar fila de descuento si existe y no hay cupón
            descuentoRow.remove();
        }
    }

    finalizarCompra() {
        if (this.cart.length === 0) {
            this.mostrarAlerta('El carrito está vacío', 'warning');
            return;
        }
        
        // redireccion al checkout
        alert('Redirigiendo a la página de pago...');
        // window.location.href = 'checkout.html';
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos necesarios para el carrito
    const styles = document.createElement('style');
    styles.textContent = `
        .product-image {
            width: 70px;
            height: 70px;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            border-radius: 6px;
        }
        
        .product-image-container {
            min-width: 70px;
        }
        
        .product-title {
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .alert-cupon {
            font-size: 14px;
            padding: 8px 12px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .descuento-row {
            animation: fadeIn 0.3s;
        }
    `;
    document.head.appendChild(styles);
    
    // Inicializar la página del carrito
    window.carritoPage = new CarritoPage();
});