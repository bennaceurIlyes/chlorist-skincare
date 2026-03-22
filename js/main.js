/**
 * Chlorice Skincare — Main JavaScript
 * Handles: mobile nav, scroll effects, animations, shopping cart, checkout
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. Mobile Menu Toggle
    // =========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    let navOverlay = document.querySelector('.nav-overlay');
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
    }

    function openMobileNav() {
        if (!navLinks) return;
        navLinks.style.display = 'flex';
        navLinks.getBoundingClientRect();
        navLinks.classList.add('mobile-open');
        navOverlay.classList.add('active');
        if (menuToggle) menuToggle.textContent = '\u2715';
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        if (!navLinks) return;
        navLinks.classList.remove('mobile-open');
        navOverlay.classList.remove('active');
        if (menuToggle) menuToggle.textContent = '\u2630';
        document.body.style.overflow = '';
        navLinks.addEventListener('transitionend', () => {
            if (!navLinks.classList.contains('mobile-open')) {
                navLinks.style.display = '';
            }
        }, { once: true });
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            if (navLinks.classList.contains('mobile-open')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    navOverlay.addEventListener('click', closeMobileNav);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));
    }

    // =========================================================
    // 2. Header Scroll Effect
    // =========================================================
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // =========================================================
    // 3. Scroll Animations
    // =========================================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { rootMargin: '0px', threshold: 0.15 });
    fadeElements.forEach(el => observer.observe(el));

    // =========================================================
    // 4. Shopping Cart Logic
    // =========================================================
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartCountBadge = document.querySelector('.cart-count');

    let cart = JSON.parse(localStorage.getItem('chlorice_cart')) || [];

    function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="cart-empty-message">Your cart is empty</div>';
            } else {
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='img/produit1.png'">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">${parseFloat(item.price).toLocaleString()} DA</div>
                            <div class="cart-item-controls">
                                <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="cart-close" onclick="removeFromCart('${item.id}')" style="font-size:1.25rem;">&times;</button>
                    </div>
                `).join('');
            }
        }

        const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
        if (cartSubtotalEl) cartSubtotalEl.textContent = `${subtotal.toLocaleString()} DA`;

        localStorage.setItem('chlorice_cart', JSON.stringify(cart));
    }

    window.updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
            updateCartUI();
        }
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        updateCartUI();
    };

    window.addToCart = (product) => {
        const existing = cart.find(i => i.id === String(product.id));
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, id: String(product.id), quantity: 1 });
        }
        updateCartUI();
        if (cartDrawer) {
            cartDrawer.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
        }
    };

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartDrawer.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
        });
    }
    if (cartClose) {
        cartClose.addEventListener('click', () => {
            cartDrawer.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');
        });
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    // Add-to-cart buttons (for static product cards)
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart({
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price,
                image: btn.dataset.image
            });
        });
    });

    updateCartUI();

    // =========================================================
    // 5. Checkout Modal — inject into DOM (skip on dedicated checkout page)
    // =========================================================
    if (!window.location.pathname.includes('checkout.html')) {
        injectCheckoutModal();
    }

    function injectCheckoutModal() {
        if (document.getElementById('checkoutModal')) return;
        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.innerHTML = `
            <div class="checkout-backdrop" id="checkoutBackdrop"></div>
            <div class="checkout-box">
                <div class="checkout-header">
                    <h3>Complete Your Order</h3>
                    <button class="checkout-close-btn" id="checkoutCloseBtn">&times;</button>
                </div>
                <form id="checkoutForm">
                    <div class="checkout-field">
                        <label>Full Name</label>
                        <input type="text" id="co_name" placeholder="e.g. Fatima Zohra" required>
                    </div>
                    <div class="checkout-field">
                        <label>Phone Number</label>
                        <input type="tel" id="co_phone" placeholder="e.g. 0555 123 456" required>
                    </div>
                    <div class="checkout-field">
                        <label>Delivery Address</label>
                        <textarea id="co_address" rows="3" placeholder="Street, City, Wilaya" required></textarea>
                    </div>
                    <div class="checkout-summary" id="checkoutSummary"></div>
                    <div id="checkoutError" class="checkout-error" style="display:none;"></div>
                    <button type="submit" class="checkout-submit-btn" id="checkoutSubmitBtn">
                        Place Order
                    </button>
                </form>
                <div id="checkoutSuccess" style="display:none;" class="checkout-success">
                    <div style="font-size:3rem;">✅</div>
                    <h3>Order Placed!</h3>
                    <p>Thank you! We'll call you to confirm your order shortly.</p>
                    <button onclick="closeCheckoutModal()" class="checkout-submit-btn" style="margin-top:1rem;">Continue Shopping</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Modal styles
        const style = document.createElement('style');
        style.textContent = `
            #checkoutModal {
                display: none;
                position: fixed; inset: 0; z-index: 2000;
                align-items: center; justify-content: center;
            }
            #checkoutModal.open { display: flex; }
            .checkout-backdrop {
                position: absolute; inset: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
            }
            .checkout-box {
                position: relative; z-index: 1;
                background: white;
                border-radius: 20px;
                padding: 2rem;
                width: 90%; max-width: 480px;
                max-height: 90vh; overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                animation: checkoutSlideIn 0.3s cubic-bezier(0.16,1,0.3,1);
            }
            @keyframes checkoutSlideIn {
                from { opacity:0; transform: scale(0.95) translateY(20px); }
                to   { opacity:1; transform: scale(1) translateY(0); }
            }
            .checkout-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 1.5rem;
            }
            .checkout-header h3 { font-size:1.25rem; font-weight:600; }
            .checkout-close-btn {
                background:none; border:none; font-size:1.5rem;
                cursor:pointer; color:#6B7280; line-height:1;
            }
            .checkout-field { margin-bottom: 1.25rem; }
            .checkout-field label {
                display:block; font-size:0.75rem; font-weight:600;
                text-transform:uppercase; letter-spacing:0.05em;
                color:#385A48; margin-bottom:0.4rem;
            }
            .checkout-field input,
            .checkout-field textarea {
                width:100%; padding:0.85rem 1rem;
                border:1px solid #E5E7EB; border-radius:10px;
                font-family:inherit; font-size:0.95rem;
                transition: border-color 0.2s;
            }
            .checkout-field input:focus,
            .checkout-field textarea:focus {
                outline:none; border-color:#385A48;
                box-shadow: 0 0 0 3px rgba(56,90,72,0.08);
            }
            .checkout-summary {
                background:#F8F9FA; border-radius:10px;
                padding:1rem; margin-bottom:1.25rem;
                font-size:0.875rem;
            }
            .checkout-summary .co-item {
                display:flex; justify-content:space-between;
                padding:0.35rem 0; color:#374151;
            }
            .checkout-summary .co-total {
                display:flex; justify-content:space-between;
                padding-top:0.6rem; margin-top:0.6rem;
                border-top:1px solid #E5E7EB;
                font-weight:700; font-size:1rem;
            }
            .checkout-submit-btn {
                width:100%; padding:1rem;
                background:#385A48; color:white;
                border:none; border-radius:10px;
                font-size:1rem; font-weight:600;
                cursor:pointer; transition: background 0.2s, transform 0.2s;
            }
            .checkout-submit-btn:hover { background:#254441; transform:translateY(-1px); }
            .checkout-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
            .checkout-error {
                background:#FEE2E2; color:#B91C1C;
                padding:0.75rem 1rem; border-radius:8px;
                margin-bottom:1rem; font-size:0.875rem;
            }
            .checkout-success {
                text-align:center; padding:1rem 0;
            }
            .checkout-success h3 { margin:1rem 0 0.5rem; font-size:1.5rem; }
            .checkout-success p { color:#6B7280; }
        `;
        document.head.appendChild(style);

        // Wire up events
        document.getElementById('checkoutBackdrop').addEventListener('click', closeCheckoutModal);
        document.getElementById('checkoutCloseBtn').addEventListener('click', closeCheckoutModal);
        document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    }

    window.openCheckoutModal = function () {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Render order summary
        const summary = document.getElementById('checkoutSummary');
        const subtotal = cart.reduce((a, i) => a + parseFloat(i.price) * i.quantity, 0);
        summary.innerHTML = cart.map(i => `
            <div class="co-item">
                <span>${i.name} × ${i.quantity}</span>
                <span>${(parseFloat(i.price) * i.quantity).toLocaleString()} DA</span>
            </div>
        `).join('') + `
            <div class="co-total">
                <span>Total</span>
                <span>${subtotal.toLocaleString()} DA</span>
            </div>
        `;

        document.getElementById('checkoutSuccess').style.display = 'none';
        document.getElementById('checkoutForm').style.display = 'block';
        document.getElementById('checkoutError').style.display = 'none';
        document.getElementById('checkoutModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.closeCheckoutModal = function () {
        document.getElementById('checkoutModal').classList.remove('open');
        document.body.style.overflow = '';
    };

    async function handleCheckoutSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('checkoutSubmitBtn');
        const errEl = document.getElementById('checkoutError');
        const name = document.getElementById('co_name').value.trim();
        const phone = document.getElementById('co_phone').value.trim();
        const address = document.getElementById('co_address').value.trim();

        btn.disabled = true;
        btn.textContent = 'Placing Order...';
        errEl.style.display = 'none';

        try {
            const db = window._supabase;
            if (!db) throw new Error('Database not connected.');

            // 1. Create the order
            const { data: orderData, error: orderErr } = await db
                .from('orders')
                .insert({ customer_name: name, customer_phone: phone, customer_address: address })
                .select('id')
                .single();

            if (orderErr) throw orderErr;
            const orderId = orderData.id;

            // 2. Insert order items
            const items = cart.map(item => ({
                order_id: orderId,
                product_id: item.productDbId || null,
                quantity: item.quantity,
                price: parseFloat(item.price)
            }));

            const { error: itemsErr } = await db.from('order_items').insert(items);
            if (itemsErr) throw itemsErr;

            // 3. Clear cart and show success
            cart = [];
            localStorage.removeItem('chlorice_cart');
            updateCartUI();

            // Close cart drawer if open
            if (cartDrawer) cartDrawer.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');

            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('checkoutSuccess').style.display = 'block';

        } catch (err) {
            console.error('Order error:', err);
            errEl.textContent = 'Failed to place order: ' + (err.message || 'Please try again.');
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Place Order';
        }
    }

    // Checkout button in cart drawer now navigates to checkout.html (handled via href)
});
