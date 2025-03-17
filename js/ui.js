/**
 * UI module for handling the user interface interactions
 */

const UI = {
    // DOM element references
    elements: {
        productsContainer: document.querySelector('.products-container'),
        cartItems: document.querySelector('.cart-items'),
        subtotalValue: document.querySelector('.subtotal-value'),
        checkoutBtn: document.getElementById('checkout-btn'),
        checkoutModal: document.getElementById('checkout-modal'),
        orderItems: document.querySelector('.order-items'),
        totalValue: document.querySelector('.total-value'),
        confirmOrderBtn: document.getElementById('confirm-order'),
        villaSelect: document.getElementById('villa-select'),
        searchInput: document.getElementById('search-input'),
        tabButtons: document.querySelectorAll('.tab-button'),
        customPriceModal: document.getElementById('custom-price-modal'),
        customPriceInput: document.getElementById('custom-price-input'),
        confirmCustomPriceBtn: document.getElementById('confirm-custom-price'),
        themeToggle: document.getElementById('theme-toggle-checkbox'),
        customerName: document.getElementById('customer-name'),
        customerRoom: document.getElementById('customer-room'),
        paymentOptions: document.querySelectorAll('.payment-option'),
        clearCartBtn: document.getElementById('clear-cart')
    },
    
    // Current state variables
    state: {
        selectedVilla: 'oh-yeah',
        currentCategory: 'all',
        searchQuery: '',
        selectedPaymentMethod: '',
        customPriceProduct: null,
        darkTheme: false
    },
    
    /**
     * Initialize the UI
     */
    init: function() {
        this.loadThemePreference();
        this.setupEventListeners();
        this.renderProducts();
    },
    
    /**
     * Set up all event listeners
     */
    setupEventListeners: function() {
        // Villa selector change
        this.elements.villaSelect.addEventListener('change', (e) => {
            this.state.selectedVilla = e.target.value;
            this.renderProducts();
        });
        
        // Search input
        this.elements.searchInput.addEventListener('input', utils.debounce((e) => {
            this.state.searchQuery = e.target.value.toLowerCase();
            this.renderProducts();
        }, 300));
        
        // Tab buttons
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.elements.tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.state.currentCategory = button.dataset.category;
                this.renderProducts();
            });
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.elements.checkoutModal.style.display = 'none';
                this.elements.customPriceModal.style.display = 'none';
            });
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('change', () => {
            this.toggleTheme();
        });
        
        // Payment method selection
        this.elements.paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.elements.paymentOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.state.selectedPaymentMethod = option.dataset.method;
                this.elements.confirmOrderBtn.disabled = false;
            });
        });
        
        // Confirm custom price
        this.elements.confirmCustomPriceBtn.addEventListener('click', () => {
            const price = parseFloat(this.elements.customPriceInput.value);
            if (!isNaN(price) && price >= 0) {
                const product = {...this.state.customPriceProduct, price};
                Cart.addToCart(product);
                this.elements.customPriceModal.style.display = 'none';
                utils.showNotification(`${product.name} přidán do košíku`);
            }
        });
        
        // Clear cart
        this.elements.clearCartBtn.addEventListener('click', () => {
            Cart.clearCart();
            this.renderCart();
            utils.showNotification('Košík byl vyprázdněn');
        });
    },
    
    /**
     * Render product cards based on current filters
     */
    renderProducts: function() {
        const currentInventory = inventory[this.state.selectedVilla] || [];
        let filteredProducts = [...currentInventory];
        
        // Filter by category
        if (this.state.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === this.state.currentCategory
            );
        }
        
        // Filter by search query
        if (this.state.searchQuery) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(this.state.searchQuery)
            );
        }
        
        // Skip the blank first item
        filteredProducts = filteredProducts.filter(product => product.name !== '');
        
        // Generate HTML
        this.elements.productsContainer.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            this.elements.productsContainer.innerHTML = `
                <div class="empty-products-message">
                    <i class="fas fa-search"></i>
                    <p>Žádné produkty nenalezeny</p>
                </div>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.customPrice ? 'Vlastní cena' : utils.formatPrice(product.price, product.currency)}</div>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn">
                        <i class="fas fa-plus"></i> Přidat
                    </button>
                </div>
            `;
            
            // Add click event for adding to cart
            const addBtn = card.querySelector('.add-to-cart-btn');
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (product.customPrice) {
                    this.state.customPriceProduct = product;
                    this.showCustomPriceModal();
                } else {
                    Cart.addToCart(product);
                    utils.animateElement(card, 'adding-to-cart');
                    utils.showNotification(`${product.name} přidán do košíku`);
                }
            });
            
            this.elements.productsContainer.appendChild(card);
        });
    },
    
    /**
     * Render the cart items
     */
    renderCart: function() {
        const cartItems = Cart.getItems();
        this.elements.cartItems.innerHTML = '';
        
        if (cartItems.length === 0) {
            this.elements.cartItems.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Váš košík je prázdný</p>
                    <p>Přidejte produkty kliknutím na tlačítko "Přidat"</p>
                </div>
            `;
            this.elements.subtotalValue.textContent = utils.formatPrice(0, 'CZK');
            this.elements.checkoutBtn.disabled = true;
            return;
        }
        
        let subtotal = 0;
        
        cartItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // Calculate item total in CZK
            const itemTotal = item.quantity * utils.convertCurrency(
                item.price, 
                item.currency, 
                'CZK'
            );
            
            subtotal += itemTotal;
            
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${utils.formatPrice(item.price, item.currency)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-btn">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-btn">+</button>
                    </div>
                    <button class="remove-item-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Set up quantity buttons
            const decreaseBtn = itemElement.querySelector('.decrease-btn');
            const increaseBtn = itemElement.querySelector('.increase-btn');
            const removeBtn = itemElement.querySelector('.remove-item-btn');
            
            decreaseBtn.addEventListener('click', () => {
                Cart.updateQuantity(index, item.quantity - 1);
                this.renderCart();
            });
            
            increaseBtn.addEventListener('click', () => {
                Cart.updateQuantity(index, item.quantity + 1);
                this.renderCart();
            });
            
            removeBtn.addEventListener('click', () => {
                Cart.removeItem(index);
                this.renderCart();
                utils.showNotification(`${item.name} odstraněn z košíku`);
            });
            
            this.elements.cartItems.appendChild(itemElement);
        });
        
        this.elements.subtotalValue.textContent = utils.formatPrice(subtotal, 'CZK');
        this.elements.checkoutBtn.disabled = false;
    },
    
    /**
     * Show the checkout modal
     */
    showCheckoutModal: function() {
        const cartItems = Cart.getItems();
        this.elements.orderItems.innerHTML = '';
        
        let total = 0;
        
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            
            const itemTotal = item.quantity * utils.convertCurrency(
                item.price, 
                item.currency, 
                'CZK'
            );
            
            total += itemTotal;
            
            itemElement.innerHTML = `
                <div class="order-item-name">
                    <span class="order-item-quantity">${item.quantity}x</span>
                    ${item.name}
                </div>
                <div class="order-item-subtotal">
                    ${utils.formatPrice(itemTotal, 'CZK')}
                </div>
            `;
            
            this.elements.orderItems.appendChild(itemElement);
        });
        
        this.elements.totalValue.textContent = utils.formatPrice(total, 'CZK');
        
        // Reset form and payment selection
        this.elements.customerName.value = '';
        this.elements.customerRoom.value = '';
        this.elements.paymentOptions.forEach(opt => opt.classList.remove('selected'));
        this.state.selectedPaymentMethod = '';
        this.elements.confirmOrderBtn.disabled = true;
        
        this.elements.checkoutModal.style.display = 'flex';
    },
    
    /**
     * Show the custom price modal
     */
    showCustomPriceModal: function() {
        this.elements.customPriceInput.value = '';
        this.elements.customPriceModal.style.display = 'flex';
        setTimeout(() => this.elements.customPriceInput.focus(), 100);
    },
    
    /**
     * Toggle between light and dark theme
     */
    toggleTheme: function() {
        this.state.darkTheme = this.elements.themeToggle.checked;
        
        if (this.state.darkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        utils.saveToStorage('darkTheme', this.state.darkTheme);
    },
    
    /**
     * Load theme preference from localStorage
     */
    loadThemePreference: function() {
        const savedTheme = utils.getFromStorage('darkTheme');
        if (savedTheme !== null) {
            this.state.darkTheme = savedTheme;
            this.elements.themeToggle.checked = savedTheme;
            if (savedTheme) {
                document.body.classList.add('dark-theme');
            }
        }
    }
};
