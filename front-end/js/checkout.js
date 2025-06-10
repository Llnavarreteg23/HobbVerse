class CheckoutPage {
    constructor() {
        // Recuperar datos del carrito
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.cuponAplicado = null;
        this.costoEnvio = 5000; // Valor por defecto
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        this.direccionSeleccionada = null;
        this.metodoPagoSeleccionado = null;
        
        // Inicializar la pasarela
        this.init();
    }

    init() {
        // Verificar si hay productos en el carrito
        if (this.cart.length === 0) {
            this.mostrarError('Tu carrito está vacío', 'Añade productos antes de continuar con el pago');
            return;
        }

        // Verificar si el usuario está logueado
        if (!this.currentUser.isLoggedIn) {
            this.mostrarError('Necesitas iniciar sesión', 'Por favor inicia sesión para continuar con el pago');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=checkout';
            }, 2000);
            return;
        }

        // Cargar información del cupón aplicado desde el carrito
        const cuponStorage = localStorage.getItem('applied_coupon');
        if (cuponStorage) {
            try {
                this.cuponAplicado = JSON.parse(cuponStorage);
            } catch (e) {
                console.error('Error al cargar el cupón:', e);
            }
        }

        // Establecer la dirección por defecto si está disponible
        if (this.currentUser.addresses && this.currentUser.addresses.length > 0) {
            const direccionPredeterminada = this.currentUser.addresses.find(addr => addr.isDefault);
            this.direccionSeleccionada = direccionPredeterminada || this.currentUser.addresses[0];
        }

        // Cargar componentes de la UI
        this.loadCheckoutSummary();
        this.loadUserAddresses();
        this.loadPaymentMethods();
        this.setupEventListeners();
    }

    loadCheckoutSummary() {
        const summaryContainer = document.getElementById('checkout-summary');
        if (!summaryContainer) return;

        // Calcular subtotal
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Descuento por cupón
        let descuento = 0;
        let cuponDescripcion = '';
        if (this.cuponAplicado) {
            cuponDescripcion = this.cuponAplicado.descripcion;
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

        // Mostrar resumen de productos
        let productosHTML = '';
        this.cart.forEach(item => {
            productosHTML += `
                <div class="checkout-product d-flex align-items-center mb-3">
                    <div class="checkout-product-image me-3">
                        <div class="product-image" style="background-image: url('${item.mainImage}')"></div>
                    </div>
                    <div class="checkout-product-details flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <div class="d-flex justify-content-between mt-1">
                            <small class="text-muted">Cantidad: ${item.quantity}</small>
                            <span>$${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        // Generar HTML para el resumen
        summaryContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Resumen de Compra</h5>
                </div>
                <div class="card-body">
                    <div class="checkout-products">
                        ${productosHTML}
                    </div>
                    
                    <hr>
                    
                    <div class="checkout-totals">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>$${subtotal.toLocaleString()}</span>
                        </div>
                        
                        ${this.cuponAplicado && descuento > 0 ? `
                            <div class="d-flex justify-content-between mb-2 text-success">
                                <span>Descuento (${this.cuponAplicado.codigo}):</span>
                                <span>-$${descuento.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        
                        <div class="d-flex justify-content-between mb-3">
                            <span>Envío:</span>
                            <span>${envio === 0 ? 'Gratis' : `$${envio.toLocaleString()}`}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span class="fs-5 text-primary">$${total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadUserAddresses() {
        const addressesContainer = document.getElementById('addresses-container');
        if (!addressesContainer) return;

        if (!this.currentUser.addresses || this.currentUser.addresses.length === 0) {
            addressesContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No tienes direcciones guardadas. Por favor, añade una dirección para continuar.
                </div>
                <button class="btn btn-outline-primary" id="add-address-btn">
                    <i class="bi bi-plus-circle me-2"></i>Añadir dirección
                </button>
            `;
            return;
        }

        let addressesHTML = '';
        this.currentUser.addresses.forEach(address => {
            const isSelected = this.direccionSeleccionada && this.direccionSeleccionada.id === address.id;
            
            addressesHTML += `
                <div class="address-card mb-3 ${isSelected ? 'selected' : ''}" data-address-id="${address.id}">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="form-check">
                                <input class="form-check-input address-radio" type="radio" name="selectedAddress" 
                                    id="address-${address.id}" ${isSelected ? 'checked' : ''}>
                                <label class="form-check-label" for="address-${address.id}">
                                    <strong>${address.name}</strong>
                                </label>
                            </div>
                            ${address.isDefault ? '<span class="badge bg-primary ms-2">Predeterminada</span>' : ''}
                        </div>
                        <div class="address-details mt-2 ms-4">
                            <p class="mb-1">${address.street}</p>
                            <p class="mb-1">${address.city}, ${address.state} ${address.zip}</p>
                            <p class="mb-0">Tel: ${address.phone}</p>
                            ${address.notes ? `<p class="text-muted small mt-1">${address.notes}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        addressesContainer.innerHTML = `
            <div class="addresses-list mb-3">
                ${addressesHTML}
            </div>
            <button class="btn btn-outline-primary" id="add-address-btn">
                <i class="bi bi-plus-circle me-2"></i>Añadir nueva dirección
            </button>
        `;
    }

    loadPaymentMethods() {
        const paymentContainer = document.getElementById('payment-container');
        if (!paymentContainer) return;

        paymentContainer.innerHTML = `
            <div class="payment-methods mb-4">
                <div class="payment-method-card mb-3" data-method="tarjeta">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="form-check">
                                <input class="form-check-input payment-radio" type="radio" name="paymentMethod" 
                                    id="payment-tarjeta" checked>
                                <label class="form-check-label" for="payment-tarjeta">
                                    <strong>Tarjeta de Crédito o Débito</strong>
                                </label>
                            </div>
                            <div class="ms-auto">
                                <img src="https://via.placeholder.com/40x25?text=Visa" alt="Visa" class="me-1">
                                <img src="https://via.placeholder.com/40x25?text=MC" alt="MasterCard" class="me-1">
                                <img src="https://via.placeholder.com/40x25?text=Amex" alt="American Express">
                            </div>
                        </div>
                        
                        <div class="payment-form" id="tarjeta-form">
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label class="form-label">Número de tarjeta</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                                        <span class="input-group-text"><i class="bi bi-credit-card"></i></span>
                                    </div>
                                    <div class="invalid-feedback">Por favor ingresa un número de tarjeta válido</div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Fecha de expiración</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="card-expiry" placeholder="MM/YY" maxlength="5">
                                        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Código de seguridad</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="card-cvv" placeholder="123" maxlength="4">
                                        <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Nombre en la tarjeta</label>
                                <input type="text" class="form-control" id="card-name" placeholder="NOMBRE APELLIDO">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-method-card mb-3" data-method="pse">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="form-check">
                                <input class="form-check-input payment-radio" type="radio" name="paymentMethod" 
                                    id="payment-pse">
                                <label class="form-check-label" for="payment-pse">
                                    <strong>PSE (Pago Seguro Electrónico)</strong>
                                </label>
                            </div>
                            <div class="ms-auto">
                                <img src="https://via.placeholder.com/60x25?text=PSE" alt="PSE">
                            </div>
                        </div>
                        
                        <div class="payment-form d-none" id="pse-form">
                            <div class="mb-3">
                                <label class="form-label">Tipo de persona</label>
                                <select class="form-select" id="pse-tipo">
                                    <option value="">Seleccionar...</option>
                                    <option value="natural">Persona Natural</option>
                                    <option value="juridica">Persona Jurídica</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Banco</label>
                                <select class="form-select" id="pse-banco">
                                    <option value="">Seleccionar banco...</option>
                                    <option value="1">Bancolombia</option>
                                    <option value="2">Banco de Bogotá</option>
                                    <option value="3">Davivienda</option>
                                    <option value="4">BBVA Colombia</option>
                                    <option value="5">Banco de Occidente</option>
                                    <option value="6">Banco Popular</option>
                                    <option value="7">Banco AV Villas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-method-card" data-method="efectivo">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                            <div class="form-check">
                                <input class="form-check-input payment-radio" type="radio" name="paymentMethod" 
                                    id="payment-efectivo">
                                <label class="form-check-label" for="payment-efectivo">
                                    <strong>Pago en efectivo</strong>
                                </label>
                            </div>
                            <div class="ms-auto">
                                <img src="https://via.placeholder.com/40x25?text=Efecty" alt="Efecty" class="me-1">
                                <img src="https://via.placeholder.com/40x25?text=Baloto" alt="Baloto">
                            </div>
                        </div>
                        
                        <div class="payment-form d-none" id="efectivo-form">
                            <div class="alert alert-info small">
                                <i class="bi bi-info-circle me-2"></i>
                                Se generará un código de pago que podrás usar en cualquier punto de pago autorizado.
                                Tu pedido será procesado una vez se confirme el pago.
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Red de pago</label>
                                <select class="form-select" id="efectivo-red">
                                    <option value="">Seleccionar...</option>
                                    <option value="efecty">Efecty</option>
                                    <option value="baloto">Baloto</option>
                                    <option value="puntored">Puntored</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h6 class="mb-3">Resumen de facturación</h6>
                    
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="factura-electronica">
                        <label class="form-check-label" for="factura-electronica">
                            Quiero factura electrónica
                        </label>
                    </div>
                    
                    <div id="factura-form" class="d-none">
                        <div class="mb-3">
                            <label class="form-label">Número de identificación (NIT/CC)</label>
                            <input type="text" class="form-control" id="factura-nit">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Razón social / Nombre completo</label>
                            <input type="text" class="form-control" id="factura-nombre">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="terms-check" required>
                <label class="form-check-label" for="terms-check">
                    Acepto los <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">términos y condiciones</a> y las <a href="#" data-bs-toggle="modal" data-bs-target="#privacyModal">políticas de privacidad</a>
                </label>
                <div class="invalid-feedback">
                    Debes aceptar los términos y condiciones para continuar
                </div>
            </div>
            
            <button class="btn btn-primary btn-lg w-100" id="complete-payment-btn">
                <i class="bi bi-lock me-2"></i>Completar compra
            </button>
        `;
    }

    setupEventListeners() {
        // Selección de dirección
        document.querySelectorAll('.address-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const addressId = card.dataset.addressId;
                this.seleccionarDireccion(addressId);
                
                // Marcar el radio button correspondiente
                const radio = card.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });

        // Botón para añadir nueva dirección
        const addAddressBtn = document.getElementById('add-address-btn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => {
                this.mostrarModalDireccion();
            });
        }

        // Selección de método de pago
        document.querySelectorAll('.payment-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.seleccionarMetodoPago(radio.id.replace('payment-', ''));
            });
        });

        // Campos de tarjeta
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                    }
                    formattedValue += value[i];
                }
                
                e.target.value = formattedValue;
            });
        }

        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                
                e.target.value = value;
            });
        }

        // Checkbox factura electrónica
        const facturaCheck = document.getElementById('factura-electronica');
        if (facturaCheck) {
            facturaCheck.addEventListener('change', (e) => {
                const facturaForm = document.getElementById('factura-form');
                if (facturaForm) {
                    facturaForm.classList.toggle('d-none', !e.target.checked);
                }
            });
        }

        // Botón completar compra
        const completeBtn = document.getElementById('complete-payment-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.procesarPago();
            });
        }
    }

    seleccionarDireccion(addressId) {
        // Actualizar variable de dirección seleccionada
        this.direccionSeleccionada = this.currentUser.addresses.find(addr => addr.id === addressId);
        
        // Actualizar UI
        document.querySelectorAll('.address-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.addressId === addressId);
        });
    }

    seleccionarMetodoPago(metodo) {
        this.metodoPagoSeleccionado = metodo;
        
        // Ocultar todos los formularios
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('d-none');
        });
        
        // Mostrar el formulario correspondiente
        const formActivo = document.getElementById(`${metodo}-form`);
        if (formActivo) {
            formActivo.classList.remove('d-none');
        }
    }

    mostrarModalDireccion() {
        // Verificar si ya existe el modal
        let modal = document.getElementById('addressModal');
        
        if (!modal) {
            // Crear el modal
            modal = document.createElement('div');
            modal.id = 'addressModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Añadir nueva dirección</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addressForm">
                                <div class="row">
                                    <div class="col-12 mb-3">
                                        <label class="form-label">Nombre para esta dirección</label>
                                        <input type="text" class="form-control" id="addressName" required placeholder="Ej. Casa, Oficina">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label class="form-label">Dirección</label>
                                        <input type="text" class="form-control" id="addressStreet" required placeholder="Calle, Carrera, Avenida, etc.">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Código Postal</label>
                                        <input type="text" class="form-control" id="addressZip" placeholder="Código postal">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Ciudad</label>
                                        <input type="text" class="form-control" id="addressCity" required placeholder="Ciudad">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Departamento</label>
                                        <select class="form-select" id="addressState" required>
                                            <option value="">Seleccionar...</option>
                                            <option value="Amazonas">Amazonas</option>
                                            <option value="Antioquia">Antioquia</option>
                                            <option value="Arauca">Arauca</option>
                                            <option value="Atlántico">Atlántico</option>
                                            <option value="Bolívar">Bolívar</option>
                                            <option value="Boyacá">Boyacá</option>
                                            <option value="Caldas">Caldas</option>
                                            <option value="Caquetá">Caquetá</option>
                                            <option value="Casanare">Casanare</option>
                                            <option value="Cauca">Cauca</option>
                                            <option value="Cesar">Cesar</option>
                                            <option value="Chocó">Chocó</option>
                                            <option value="Córdoba">Córdoba</option>
                                            <option value="Cundinamarca">Cundinamarca</option>
                                            <option value="Guainía">Guainía</option>
                                            <option value="Guaviare">Guaviare</option>
                                            <option value="Huila">Huila</option>
                                            <option value="La Guajira">La Guajira</option>
                                            <option value="Magdalena">Magdalena</option>
                                            <option value="Meta">Meta</option>
                                            <option value="Nariño">Nariño</option>
                                            <option value="Norte de Santander">Norte de Santander</option>
                                            <option value="Putumayo">Putumayo</option>
                                            <option value="Quindío">Quindío</option>
                                            <option value="Risaralda">Risaralda</option>
                                            <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                                            <option value="Santander">Santander</option>
                                            <option value="Sucre">Sucre</option>
                                            <option value="Tolima">Tolima</option>
                                            <option value="Valle del Cauca">Valle del Cauca</option>
                                            <option value="Vaupés">Vaupés</option>
                                            <option value="Vichada">Vichada</option>
                                            <option value="Bogotá D.C.">Bogotá D.C.</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Teléfono de contacto</label>
                                    <input type="tel" class="form-control" id="addressPhone" required placeholder="Teléfono">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Instrucciones adicionales (opcional)</label>
                                    <textarea class="form-control" id="addressNotes" rows="2" placeholder="Información adicional para la entrega"></textarea>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input type="checkbox" class="form-check-input" id="addressDefault">
                                    <label class="form-check-label" for="addressDefault">Establecer como dirección predeterminada</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="saveAddressBtn">Guardar dirección</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Configurar evento para guardar dirección
            document.getElementById('saveAddressBtn').addEventListener('click', () => {
                this.guardarDireccion();
            });
        }
        
        // Mostrar el modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    guardarDireccion() {
        const form = document.getElementById('addressForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const nuevaDireccion = {
            id: Date.now().toString(),
            name: document.getElementById('addressName').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            state: document.getElementById('addressState').value,
            zip: document.getElementById('addressZip').value,
            phone: document.getElementById('addressPhone').value,
            notes: document.getElementById('addressNotes').value,
            isDefault: document.getElementById('addressDefault').checked
        };
        
        // Si no hay direcciones, esta será la predeterminada
        if (!this.currentUser.addresses || this.currentUser.addresses.length === 0) {
            nuevaDireccion.isDefault = true;
        }
        
        // Si esta dirección es predeterminada, quitar ese estado de las demás
        if (nuevaDireccion.isDefault && this.currentUser.addresses) {
            this.currentUser.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }
        
        // Agregar la nueva dirección
        if (!this.currentUser.addresses) {
            this.currentUser.addresses = [];
        }
        
        this.currentUser.addresses.push(nuevaDireccion);
        
        // Actualizar localStorage
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Seleccionar la nueva dirección
        this.direccionSeleccionada = nuevaDireccion;
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addressModal'));
        if (modal) {
            modal.hide();
        }
        
        // Recargar la lista de direcciones
        this.loadUserAddresses();
        
        // Mostrar notificación
        this.mostrarNotificacion('Dirección guardada correctamente', 'success');
    }

    procesarPago() {
        // Validar que se haya seleccionado una dirección
        if (!this.direccionSeleccionada) {
            this.mostrarNotificacion('Por favor selecciona una dirección de envío', 'warning');
            return;
        }
        
        // Validar que se haya seleccionado un método de pago
        if (!this.metodoPagoSeleccionado) {
            this.mostrarNotificacion('Por favor selecciona un método de pago', 'warning');
            return;
        }
        
        // Validar el formulario según el método de pago
        if (this.metodoPagoSeleccionado === 'tarjeta') {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            const cardName = document.getElementById('card-name').value;
            
            if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                this.mostrarNotificacion('Por favor completa todos los campos de la tarjeta', 'warning');
                return;
            }
        } else if (this.metodoPagoSeleccionado === 'pse') {
            const pseTipo = document.getElementById('pse-tipo').value;
            const pseBanco = document.getElementById('pse-banco').value;
            
            if (!pseTipo || !pseBanco) {
                this.mostrarNotificacion('Por favor completa todos los campos para el pago PSE', 'warning');
                return;
            }
        } else if (this.metodoPagoSeleccionado === 'efectivo') {
            const efectivoRed = document.getElementById('efectivo-red').value;
            
            if (!efectivoRed) {
                this.mostrarNotificacion('Por favor selecciona una red de pago', 'warning');
                return;
            }
        }
        
        // Validar aceptación de términos
        const termsCheck = document.getElementById('terms-check');
        if (!termsCheck.checked) {
            termsCheck.classList.add('is-invalid');
            return;
        }
        
        // Mostrar spinner de carga
        this.mostrarSpinner();
        
        // Simular procesamiento de pago (3 segundos)
        setTimeout(() => {
            // Generar la orden y guardarla
            this.crearOrden();
            
            // Redirigir a la página de confirmación
            window.location.href = 'payment-success.html';
        }, 3000);
    }

    crearOrden() {
        // Calcular totales
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
        
        // Costo de envío
        let envio = this.costoEnvio;
        if (this.cuponAplicado && this.cuponAplicado.codigo === 'ENVIOGRATIS') {
            envio = 0;
        }
        
        // Total
        const total = subtotal - descuento + envio;
        
        // Crear objeto de orden
        const orden = {
            id: Date.now().toString(),
            orderNumber: 'HV-' + Math.floor(10000 + Math.random() * 90000),
            date: Date.now(),
            status: this.metodoPagoSeleccionado === 'efectivo' ? 'Pendiente' : 'En proceso',
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.mainImage || item.image
            })),
            subtotal: subtotal,
            discount: descuento,
            shipping: {
                cost: envio,
                address: this.direccionSeleccionada.street,
                city: this.direccionSeleccionada.city,
                state: this.direccionSeleccionada.state,
                zip: this.direccionSeleccionada.zip,
                method: 'Envío Estándar'
            },
            cupon: this.cuponAplicado ? this.cuponAplicado.codigo : null,
            total: total,
            paymentMethod: this.getPaymentMethodName(),
            paymentDetails: this.getPaymentDetails(),
            reviewed: false
        };
        
        // Guardar orden en el usuario
        if (!this.currentUser.orders) {
            this.currentUser.orders = [];
        }
        
        this.currentUser.orders.push(orden);
        
        // Actualizar puntos del usuario (10 puntos por cada 100.000 de compra)
        const puntos = Math.floor(total / 10000);
        this.currentUser.points = (this.currentUser.points || 0) + puntos;
        
        // Guardar en localStorage
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Guardar datos para la página de éxito
        localStorage.setItem('last_order', JSON.stringify(orden));
        
        // Vaciar el carrito
        localStorage.setItem('cart', '[]');
        localStorage.setItem('hobbverse_carrito', '[]');
        localStorage.removeItem('applied_coupon');
    }

    getPaymentMethodName() {
        switch (this.metodoPagoSeleccionado) {
            case 'tarjeta':
                return 'Tarjeta de Crédito/Débito';
            case 'pse':
                return 'PSE';
            case 'efectivo':
                const red = document.getElementById('efectivo-red').value;
                return `Pago en efectivo (${red})`;
            default:
                return 'Método desconocido';
        }
    }

    getPaymentDetails() {
        if (this.metodoPagoSeleccionado === 'tarjeta') {
            const cardNumber = document.getElementById('card-number').value;
            return {
                type: 'tarjeta',
                lastDigits: cardNumber.slice(-4),
                cardType: this.detectCardType(cardNumber)
            };
        } else if (this.metodoPagoSeleccionado === 'pse') {
            return {
                type: 'pse',
                banco: document.getElementById('pse-banco').options[document.getElementById('pse-banco').selectedIndex].text
            };
        } else if (this.metodoPagoSeleccionado === 'efectivo') {
            return {
                type: 'efectivo',
                red: document.getElementById('efectivo-red').value,
                codigo: 'REF-' + Math.floor(100000000 + Math.random() * 900000000)
            };
        }
        
        return {};
    }

    detectCardType(number) {
        // Eliminar espacios
        const cardNumber = number.replace(/\s/g, '');
        
        // Visa
        if (/^4/.test(cardNumber)) {
            return 'Visa';
        }
        
        // Mastercard
        if (/^5[1-5]/.test(cardNumber)) {
            return 'MasterCard';
        }
        
        // Amex
        if (/^3[47]/.test(cardNumber)) {
            return 'American Express';
        }
        
        return 'Desconocida';
    }

    mostrarSpinner() {
        // Crear overlay con spinner
        const overlay = document.createElement('div');
        overlay.id = 'payment-overlay';
        overlay.className = 'payment-processing-overlay';
        
        overlay.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Procesando pago...</span>
                </div>
                <h4 class="mt-3 text-white">Procesando tu pago</h4>
                <p class="text-white">Por favor no cierres esta ventana</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    mostrarNotificacion(mensaje, tipo) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-' + (tipo || 'primary');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Crear contenedor de toasts si no existe
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        const toastInstance = new bootstrap.Toast(toast, {
            delay: 3000
        });
        
        toastInstance.show();
    }

    mostrarError(titulo, mensaje) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'container py-5';
        
        errorContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow-sm border-danger">
                        <div class="card-body text-center p-5">
                            <i class="bi bi-exclamation-triangle text-danger display-1 mb-4"></i>
                            <h2 class="card-title mb-3">${titulo}</h2>
                            <p class="card-text mb-4">${mensaje}</p>
                            <a href="carrito.html" class="btn btn-primary">
                                <i class="bi bi-cart me-2"></i>Volver al carrito
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('main').innerHTML = '';
        document.querySelector('main').appendChild(errorContainer);
    }
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos necesarios para el checkout
    const styles = document.createElement('style');
    styles.textContent = `
        .address-card {
            border: 1px solid #dee2e6;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .address-card:hover {
            border-color: #adb5bd;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        
        .address-card.selected {
            border-color: #0d6efd;
            background-color: #f8f9fa;
            box-shadow: 0 0.125rem 0.25rem rgba(13, 110, 253, 0.2);
        }
        
        .payment-method-card {
            border: 1px solid #dee2e6;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .payment-form {
            padding-top: 1rem;
            padding-left: 1.75rem;
        }
        
        .product-image {
            width: 50px;
            height: 50px;
            background-size: cover;
            background-position: center;
            border-radius: 0.25rem;
        }
        
        .payment-processing-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .spinner-container {
            text-align: center;
        }
    `;
    document.head.appendChild(styles);
    
    // Inicializar la página de checkout
    window.checkoutPage = new CheckoutPage();
});