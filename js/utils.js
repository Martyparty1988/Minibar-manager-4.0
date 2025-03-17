/**
 * Utility module containing helper functions for the minibar POS system
 */

const utils = {
    /**
     * Format a price with the appropriate currency symbol
     * @param {number} price - The price to format
     * @param {string} currency - The currency code (CZK or EUR)
     * @returns {string} - Formatted price with currency
     */
    formatPrice: function(price, currency) {
        if (!price && price !== 0) return '';
        
        switch (currency) {
            case 'CZK':
                return `${price} CZK`;
            case 'EUR':
                return `${price} €`;
            default:
                return `${price} ${currency}`;
        }
    },
    
    /**
     * Convert prices between currencies
     * @param {number} price - The price to convert
     * @param {string} fromCurrency - Source currency code
     * @param {string} toCurrency - Target currency code
     * @returns {number} - Converted price
     */
    convertCurrency: function(price, fromCurrency, toCurrency) {
        // Define exchange rates (1 EUR = 25 CZK)
        const exchangeRates = {
            'EUR_TO_CZK': 25,
            'CZK_TO_EUR': 0.04, // 1 / 25
        };
        
        if (fromCurrency === toCurrency) {
            return price;
        }
        
        if (fromCurrency === 'EUR' && toCurrency === 'CZK') {
            return price * exchangeRates.EUR_TO_CZK;
        }
        
        if (fromCurrency === 'CZK' && toCurrency === 'EUR') {
            return price * exchangeRates.CZK_TO_EUR;
        }
        
        return price;
    },
    
    /**
     * Generate a unique order ID
     * @returns {string} - Unique order ID
     */
    generateOrderId: function() {
        return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    },
    
    /**
     * Format a date to a readable string
     * @param {Date} date - The date to format
     * @returns {string} - Formatted date string
     */
    formatDate: function(date) {
        if (!date) date = new Date();
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    },
    
    /**
     * Debounce function to limit the rate at which a function can fire
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the notification in ms
     */
    showNotification: function(message, duration = 3000) {
        const notification = document.getElementById('success-notification');
        const messageElement = notification.querySelector('.notification-message');
        
        messageElement.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    },
    
    /**
     * Save data to local storage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    /**
     * Retrieve data from local storage
     * @param {string} key - Storage key
     * @returns {any} - Retrieved data or null
     */
    getFromStorage: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving from localStorage:', error);
            return null;
        }
    },
    
    /**
     * Handle adding CSS class for animation and remove it after animation completes
     * @param {HTMLElement} element - The element to animate
     * @param {string} className - CSS class for the animation
     * @param {number} duration - Animation duration in milliseconds
     */
    animateElement: function(element, className, duration = 300) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
};
