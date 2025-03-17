/**
 * Main application initialization
 * This file coordinates all modules and components of the Minibar POS system
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI module
    UI.init();
    
    // Initialize Cart module
    Cart.init();
    
    // Render initial cart state
    UI.renderCart();
    
    // Handle window resizing for responsive layout adjustments
    handleResponsiveLayout();
    
    // Add swipe gestures for mobile devices
    initTouchGestures();
    
    // Log initialization
    console.log('Minibar POS System initialized');
});

/**
 * Handle closing modals when clicking outside content
 */
window.addEventListener('click', function(event) {
    const checkoutModal = document.getElementById('checkout-modal');
    const customPriceModal = document.getElementById('custom-price-modal');
    
    if (event.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    
    if (event.target === customPriceModal) {
        customPriceModal.style.display = 'none';
    }
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('custom-price-modal').style.display = 'none';
    }
    
    // Implement keyboard navigation for better accessibility
    if (event.altKey) {
        // Alt+1 to Alt+5 for category tabs
        if (event.key >= '1' && event.key <= '5') {
            const index = parseInt(event.key) - 1;
            const tabs = document.querySelectorAll('.tab-button');
            if (index < tabs.length) {
                tabs[index].click();
            }
        }
        
        // Alt+C for checkout
        if (event.key === 'c' || event.key === 'C') {
            const checkoutBtn = document.getElementById('checkout-btn');
            if (!checkoutBtn.disabled) {
                checkoutBtn.click();
            }
        }
        
        // Alt+S for search focus
        if (event.key === 's' || event.key === 'S') {
            document.getElementById('search-input').focus();
            event.preventDefault();
        }
    }
});

/**
 * Handle responsive layout adjustments
 */
function handleResponsiveLayout() {
    const updateLayout = function() {
        const windowWidth = window.innerWidth;
        const appContainer = document.querySelector('.app-container');
        
        // On small screens, stack the layout
        if (windowWidth < 768) {
            appContainer.style.gridTemplateAreas = '"header" "main" "sidebar"';
            appContainer.style.gridTemplateRows = 'var(--header-height) 1fr auto';
            appContainer.style.gridTemplateColumns = '1fr';
            
            // Adjust cart sidebar height
            document.querySelector('.cart-sidebar').style.maxHeight = '40vh';
        } else {
            // Reset to default layout on larger screens
            appContainer.style.gridTemplateAreas = '"header header" "main sidebar"';
            appContainer.style.gridTemplateRows = 'var(--header-height) 1fr';
            appContainer.style.gridTemplateColumns = '1fr var(--sidebar-width)';
            
            // Reset cart sidebar height
            document.querySelector('.cart-sidebar').style.maxHeight = '';
        }
    };
    
    // Initial call
    updateLayout();
    
    // Listen for window resize
    window.addEventListener('resize', utils.debounce(updateLayout, 250));
}

/**
 * Initialize touch gestures for mobile devices
 */
function initTouchGestures() {
    // Variables for tracking touch gestures
    let touchStartX = 0;
    let touchEndX = 0;
    const MIN_SWIPE_DISTANCE = 50;
    
    // Add swipe for cart items on mobile
    const cartItems = document.querySelector('.cart-items');
    
    // Touch start event
    cartItems.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    // Touch end event
    cartItems.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });
    
    /**
     * Handle swipe left gesture to reveal remove button
     */
    function handleSwipeGesture() {
        const swipeDistance = touchStartX - touchEndX;
        
        // Check if swipe was long enough
        if (swipeDistance > MIN_SWIPE_DISTANCE) {
            // This would typically toggle a class to reveal a 'delete' button
            // For demonstration, we'll just log it
            console.log('Left swipe detected in cart - would reveal remove button');
            
            // In a real implementation, this would identify which cart item
            // was swiped and toggle a class on that specific item
        }
    }
    
    // Add pull-to-refresh functionality
    let touchStartY = 0;
    let touchEndY = 0;
    const MIN_PULL_DISTANCE = 100;
    const productContainer = document.querySelector('.products-container');
    
    productContainer.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    productContainer.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        const pullDistance = touchEndY - touchStartY;
        
        // Detect pull-down gesture
        if (pullDistance > MIN_PULL_DISTANCE && productContainer.scrollTop === 0) {
            // Show refresh animation
            const refreshIndicator = document.createElement('div');
            refreshIndicator.className = 'refresh-indicator';
            refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
            productContainer.prepend(refreshIndicator);
            
            // Simulate refresh action
            setTimeout(() => {
                refreshIndicator.remove();
                UI.renderProducts(); // Refresh the products list
                utils.showNotification('Produkty aktualizovány');
            }, 800);
        }
    }, { passive: true });
}

/**
 * Export/Print functionality
 * This would typically connect to a receipt printer or generate PDF
 */
function exportOrderReceipt(order) {
    // This is a placeholder for receipt printing functionality
    console.log('Printing receipt for order:', order.id);
    
    // In a real implementation, this might:
    // 1. Format the order data for a receipt
    // 2. Send it to a local printer via a print API
    // 3. Generate a PDF for electronic receipts
    // 4. Save to a transaction log
    
    return {
        success: true,
        message: 'Receipt printed successfully'
    };
}

/**
 * Service worker registration for offline capabilities
 * This would make the app work offline as a Progressive Web App
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

/**
 * Global error handling
 */
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // Prevent app from completely breaking on non-critical errors
    if (!event.error.isCritical) {
        event.preventDefault();
        
        // Show user-friendly error message
        utils.showNotification('Došlo k chybě. Zkuste akci opakovat.', 5000);
    }
});
