// Load cart data from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save the cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update the cart counter display
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-counter-display');
    if (cartCounter) {
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCounter.textContent = totalQuantity;
        cartCounter.classList.toggle('show', totalQuantity > 0);
    }
}

// Helper to parse price into a number
function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        const numericValue = parseFloat(price.replace(/[^\d.]/g, ''));
        return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
}

// Add a product to the cart
function addToCart(productToAdd) {
    const price = parsePrice(productToAdd.price);
    if (price <= 0) {
        console.error('Invalid price:', productToAdd.price);
        return null;
    }

    const id = `${productToAdd.title}_${price}`;
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id,
            title: productToAdd.title,
            price: price,
            image: productToAdd.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartCounter();
    return cart.find(item => item.id === id);
}

// Show notification when item is added
function showCartNotification(productName, imageUrl) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <img src="${imageUrl}" alt="${productName}" class="notification-image">
            <div class="notification-text">
                <p>Added to Cart</p>
                <h4>${productName}</h4>
            </div>
        </div>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Render the cart page UI
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    if (cartFooter) cartFooter.style.display = 'block';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const price = parsePrice(item.price);
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        subtotal += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/100'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-price">$${price.toFixed(2)}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                <span class="item-quantity">${quantity}</span>
                <button class="quantity-btn increase-btn" data-index="${index}">+</button>
            </div>
            <div class="item-price-total">$${itemTotal.toFixed(2)}</div>
            <button class="remove-item" data-index="${index}">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    const cartSummary = document.getElementById('cart-summary');
    if (cartSummary) {
        cartSummary.innerHTML = `Subtotal: <strong>$${subtotal.toFixed(2)}</strong>`;
    }
}

// DOM events after page load
document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
    }

    // Handle "Add to Cart" button clicks
    const productButtons = document.querySelectorAll('.product-button');
    productButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.product-card');
            const priceText = card.querySelector('.product-price').textContent;
            
            const product = {
                title: card.querySelector('.product-title').textContent.trim(),
                price: priceText,
                image: card.querySelector('.product-image img').src
            };

            const addedProduct = addToCart(product);
            if (addedProduct) {
                showCartNotification(addedProduct.title, addedProduct.image);
            }
        });
    });

    // If cart page is loaded
    if (document.getElementById('cart-root')) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];

        renderCartPage();

        // Handle item quantity changes
        document.getElementById('cart-items').addEventListener('click', function(event) {
            const target = event.target;
            if (!target.matches('button')) return;

            const index = parseInt(target.dataset.index);
            if (isNaN(index)) return;

            try {
                if (target.classList.contains('increase-btn')) {
                    cart[index].quantity = (cart[index].quantity || 1) + 1;
                } else if (target.classList.contains('decrease-btn')) {
                    cart[index].quantity = (cart[index].quantity || 1) - 1;
                    if (cart[index].quantity <= 0) {
                        cart.splice(index, 1);
                    }
                } else if (target.classList.contains('remove-item')) {
                    cart.splice(index, 1);
                }

                saveCart();
                renderCartPage();
                updateCartCounter();
            } catch (error) {
                console.error('Error handling cart action:', error);
            }
        });
    }

    // Scroll animation
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeInElements.forEach(el => observer.observe(el));

    // Update cart counter on all pages
    updateCartCounter();
});
