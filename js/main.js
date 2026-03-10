/**
 * Chlorice Skincare - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            alert('Mobile menu feature coming soon.');
        });
    }

    // 2. Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 4. Shopping Cart Logic
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartCountBadge = document.querySelector('.cart-count');

    let cart = JSON.parse(localStorage.getItem('chlorice_cart')) || [];

    function updateCartUI() {
        // Update badge
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        // Render items
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="cart-empty-message">Your cart is empty</div>';
            } else {
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">${item.price} DA</div>
                            <div class="cart-item-controls">
                                <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="cart-close" onclick="removeFromCart('${item.id}')" style="font-size: 1.25rem;">&times;</button>
                    </div>
                `).join('');
            }
        }

        // Update subtotal
        const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
        if (cartSubtotalEl) cartSubtotalEl.textContent = `${subtotal.toFixed(2)} DA`;

        // Persist
        localStorage.setItem('chlorice_cart', JSON.stringify(cart));
    }

    window.updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            updateCartUI();
        }
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        updateCartUI();
    };

    window.addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        // Open drawer on add
        if (cartDrawer) {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        }
    };

    // Event Listeners
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price,
                image: btn.dataset.image
            };
            addToCart(product);
        });
    });

    updateCartUI();
});
