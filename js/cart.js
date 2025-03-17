/**
 * Cart module for managing the shopping cart functionality
 */

const Cart = {
    // Cart state
    state: {
        items: [],
        orders: []
    },
    
    /**
     * Initialize the cart
     */
    init: function() {
        this.loadFromStorage();
        this.setupEventListeners();
    },
    
    /**
     * Set up event listeners related to cart
     */
    setupEventListeners: function() {
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.addEventListener('click', () => {
            UI.showCheckoutModal();
        });
        
        // Confirm order button
        const confirmOrderBtn = document.getElementById('confirm-order');
        confirmOrderBtn.addEventListener('click', () => {
            this.processOrder();
        });
    },
    
    /**
     * Add a product to the cart
     * @param {Object} product - The product to add
     */
    addToCart: function(product) {
        // Check if product is already in cart
        const existingItemIndex = this.state.items.findIndex(item => 
            item.name === product.name && item.currency === product.currency
        );
        
        if (existingItemIndex >= 0) {
            // Increase quantity if already in cart
            this.state.items[existingItemIndex].quantity += 1;
        } else {
            // Add new item with quantity 1
            this.state.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        UI.renderCart();
    },
    
    /**
     * Remove an item from the cart
     * @param {number} index - The index of the item to remove
     */
    removeItem: function(index) {
        if (index >= 0 && index < this.state.items.length) {
            this.state.items.splice(index, 1);
            this.saveToStorage();
        }
    },
    
    /**
     * Update the quantity of an item
     * @param {number} index - The index of the item
     * @param {number} quantity - The new quantity
     */
    updateQuantity: function(index, quantity) {
        if (index >= 0 && index < this.state.items.length) {
            if (quantity <= 0) {
                this.removeItem(index);
            } else {
                this.state.items[index].quantity = quantity;
                this.saveToStorage();
            }
        }
    },
    
    /**
     * Clear all items from the cart
     */
    clearCart: function() {
        this.state.items = [];
        this.saveToStorage();
    },
    
    /**
     * Get all items in the cart
     * @returns {Array} - Array of cart items
     */
    getItems: function() {
        return this.state.items;
    },
    
    /**
     * Calculate the total value of the cart
     * @param {string} currency - The currency to calculate in
     * @returns {number} - The cart total
     */
    getTotal: function(currency = 'CZK') {
        return this.state.items.reduce((total, item) => {
            const itemValue = utils.convertCurrency(
                item.price * item.quantity, 
                item.currency, 
                currency
            );
            return total + itemValue;
        }, 0);
    },
    
    /**
     * Process and complete an order
     */
    processOrder: function() {
        const customerName = document.getElementById('customer-name').value;
        const customerRoom = document.getElementById('customer-room').value;
        const paymentMethod = UI.state.selectedPaymentMethod;
        
        if (!customerName || !paymentMethod) {
            alert('Vyplňte prosím jméno hosta a zvolte způsob platby.');
            return;
        }
        
        // If room payment is selected, room number is required
        if (paymentMethod === 'room' && !customerRoom) {
            alert('Pro platbu na pokoj je potřeba vyplnit číslo pokoje.');
            return;
        }
        
        // Create order object
        const order = {
            id: utils.generateOrderId(),
            items: [...this.state.items],
            customerName,
            customerRoom,
            paymentMethod,
            villa: UI.state.selectedVilla,
            timestamp: new Date(),
            total: this.getTotal('CZK')
        };
        
        // Add to orders history
        this.state.orders.push(order);
        
        // Save to storage and clear cart
        this.saveToStorage();
        this.clearCart();
        
        // Hide modal and render empty cart
        document.getElementById('checkout-modal').style.display = 'none';
        UI.renderCart();
        
        // Show success notification
        utils.showNotification('Objednávka byla úspěšně dokončena!');
        
        // Print receipt (in a real app this would connect to a receipt printer)
        // For demonstration, we'll just log the receipt data
        console.log('Receipt data:', order);
        
        // In a real application, you might want to send the order to a server
        // or connect to a local receipt printer here
    },
    
    /**
     * Save cart state to local storage
     */
    saveToStorage: function() {
        utils.saveToStorage('minibarCart', this.state.items);
        utils.saveToStorage('minibarOrders', this.state.orders);
    },
    
    /**
     * Load cart state from local storage
     */
    loadFromStorage: function() {
        const savedItems = utils.getFromStorage('minibarCart');
        const savedOrders = utils.getFromStorage('minibarOrders');
        
        if (savedItems) {
            this.state.items = savedItems;
        }
        
        if (savedOrders) {
            this.state.orders = savedOrders;
        }
    }
};
