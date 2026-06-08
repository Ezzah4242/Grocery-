/* =============================================
   KIRANA HOUSE – script.js
   Full functionality: cart, search, filter,
   hamburger menu, scroll effects, form validation
   ============================================= */

'use strict';

/* =============================================
   CART STATE
   ============================================= */
let cart = [];   // [{name, price, qty}]

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cartCount');
  countEl.textContent = total;
  if (total > 0) {
    countEl.classList.add('visible');
  } else {
    countEl.classList.remove('visible');
  }
}

function renderCartItems() {
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    totalEl.textContent = 'PKR 0';
    return;
  }

  itemsEl.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty">
        <button class="cart-qty-btn" data-action="decrease" data-index="${index}">-</button>
        <span>${item.qty}</span>
        <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
      </div>
      <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
    </div>
  `).join('');

  // Attach qty button listeners
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const idx = parseInt(this.dataset.index);
      const action = this.dataset.action;
      if (action === 'increase') {
        cart[idx].qty++;
      } else {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) {
          cart.splice(idx, 1);
        }
      }
      renderCartItems();
      updateCartCount();
    });
  });

  totalEl.textContent = 'PKR ' + getCartTotal().toLocaleString();
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price: parseInt(price), qty: 1 });
  }
  updateCartCount();
  renderCartItems();
  showToast(`"${name}" added to cart`);
}

/* =============================================
   ADD-TO-CART BUTTONS (delegated)
   ============================================= */
document.addEventListener('click', function (e) {
  // Full add-to-cart button
  const addBtn = e.target.closest('.add-to-cart-btn');
  if (addBtn) {
    const name = addBtn.dataset.name;
    const price = addBtn.dataset.price;
    if (name && price) {
      addToCart(name, price);
      // Quick pop animation
      addBtn.textContent = 'Added!';
      addBtn.style.background = '#1a3c2e';
      setTimeout(() => {
        addBtn.textContent = 'Add to Cart';
        addBtn.style.background = '';
      }, 1000);
    }
  }

  // Quick-add button on hover
  const quickBtn = e.target.closest('.quick-add');
  if (quickBtn) {
    const name = quickBtn.dataset.name;
    const price = quickBtn.dataset.price;
    if (name && price) addToCart(name, price);
  }
});

/* =============================================
   CART SIDEBAR OPEN / CLOSE
   ============================================= */
const cartBtn     = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Checkout button
document.getElementById('checkoutBtn').addEventListener('click', function () {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  showToast('Thank you! Order placed successfully.');
  cart = [];
  updateCartCount();
  renderCartItems();
  closeCart();
});

/* =============================================
   TOAST NOTIFICATION
   ============================================= */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* =============================================
   HAMBURGER MENU
   ============================================= */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', function () {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close nav on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

/* =============================================
   SEARCH BAR TOGGLE
   ============================================= */
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchBarWrap   = document.getElementById('searchBarWrap');
const searchCloseBtn  = document.getElementById('searchCloseBtn');
const searchInput     = document.getElementById('searchInput');
const searchBtn       = document.getElementById('searchBtn');

function openSearch() {
  searchBarWrap.classList.add('open');
  setTimeout(() => searchInput.focus(), 300);
}
function closeSearch() {
  searchBarWrap.classList.remove('open');
  searchInput.value = '';
  filterProducts('', activeCategory);
}

searchToggleBtn.addEventListener('click', openSearch);
searchCloseBtn.addEventListener('click', closeSearch);

// Live search as user types
searchInput.addEventListener('input', function () {
  filterProducts(this.value.trim().toLowerCase(), activeCategory);
});

// Search on Enter key
searchInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') filterProducts(this.value.trim().toLowerCase(), activeCategory);
});

// Search button click
searchBtn.addEventListener('click', function () {
  filterProducts(searchInput.value.trim().toLowerCase(), activeCategory);
});

/* =============================================
   CATEGORY FILTER
   ============================================= */
let activeCategory = 'all';
const catCards = document.querySelectorAll('.cat-card');

catCards.forEach(card => {
  card.addEventListener('click', function () {
    catCards.forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    activeCategory = this.dataset.filter;
    // Scroll to products on mobile
    if (window.innerWidth < 768) {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
    filterProducts(searchInput.value.trim().toLowerCase(), activeCategory);
  });
});

/* =============================================
   FILTER PRODUCTS (search + category combined)
   ============================================= */
function filterProducts(query, category) {
  const cards = document.querySelectorAll('#productsGrid .product-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardName     = (card.dataset.name || '').toLowerCase();
    const cardCategory = (card.dataset.category || '');

    const matchesSearch   = !query || cardName.includes(query);
    const matchesCategory = category === 'all' || cardCategory === category;

    if (matchesSearch && matchesCategory) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const noResults = document.getElementById('noResults');
  noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

/* =============================================
   NAVBAR SCROLL EFFECT
   ============================================= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function () {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* =============================================
   BACK TO TOP
   ============================================= */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', function () {
  if (window.scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =============================================
   SMOOTH SCROLL for nav links
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =============================================
   SCROLL REVEAL ANIMATION
   ============================================= */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal'))
        : [];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 0.07) + 's';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* =============================================
   LOAD MORE PRODUCTS
   ============================================= */
const loadMoreBtn = document.getElementById('loadMoreBtn');
const extraProducts = [
  { category: 'staples', name: 'Pink Himalayan Salt 1kg', price: 280, badge: '', img: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80', desc: 'Pure mineral salt from Khewra mines' },
  { category: 'staples', name: 'Desi Ghee 1kg', price: 1850, badge: 'Premium', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80', desc: 'Traditional pure desi ghee, rich flavor' },
  { category: 'fruits', name: 'Red Apples 1kg', price: 220, badge: 'Fresh', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', desc: 'Crisp Fuji apples, imported from KPK' },
  { category: 'vegetables', name: 'Onions 1kg', price: 80, badge: '', img: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80', desc: 'Fresh, full-flavor cooking onions' },
  { category: 'beverages', name: 'Rooh Afza 800ml', price: 450, badge: 'Classic', img: 'https://images.unsplash.com/photo-1622597467836-f3e1bfcc7f8a?w=400&q=80', desc: 'Iconic Pakistani floral syrup, refreshing' },
  { category: 'snacks', name: 'Nimko Mix 500g', price: 280, badge: '', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', desc: 'Spicy and crunchy Pakistani snack mix' },
];

loadMoreBtn.addEventListener('click', function () {
  const grid = document.getElementById('productsGrid');
  this.textContent = 'Loading...';
  this.disabled = true;

  setTimeout(() => {
    extraProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.category = product.category;
      card.dataset.name = product.name;

      card.innerHTML = `
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        <div class="product-img-wrap">
          <img src="${product.img}" alt="${product.name}" loading="lazy" />
          <button class="quick-add" data-name="${product.name}" data-price="${product.price}">Quick Add</button>
        </div>
        <div class="product-info">
          <span class="product-cat">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.desc}</p>
          <div class="product-footer">
            <div class="product-price">
              <span class="price-current">PKR ${product.price.toLocaleString()}</span>
            </div>
            <button class="add-to-cart-btn" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
          </div>
        </div>
      `;

      grid.appendChild(card);

      // Animate in
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        });
      }, 0);
    });

    this.textContent = 'No More Products';
    this.disabled = true;
    this.style.opacity = '0.5';
  }, 600);
});

/* =============================================
   CONTACT FORM VALIDATION
   ============================================= */
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

function validateField(inputId, errorId, validator, errorMsg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const value = input.value.trim();

  if (!validator(value)) {
    input.classList.add('error');
    error.textContent = errorMsg;
    return false;
  } else {
    input.classList.remove('error');
    error.textContent = '';
    return true;
  }
}

// Clear error on user input
['fullName','emailInput','phoneInput','subjectInput','messageInput'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errorEl = document.getElementById(id.replace('Input','').replace('full','name').toLowerCase() + 'Error');
    });
  }
});

contactSubmitBtn.addEventListener('click', function (e) {
  e.preventDefault();

  const isNameValid = validateField(
    'fullName', 'nameError',
    v => v.length >= 3,
    'Please enter your full name (at least 3 characters).'
  );
  const isEmailValid = validateField(
    'emailInput', 'emailError',
    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'Please enter a valid email address.'
  );
  const isPhoneValid = validateField(
    'phoneInput', 'phoneError',
    v => v.length >= 10,
    'Please enter a valid phone number.'
  );
  const isSubjectValid = validateField(
    'subjectInput', 'subjectError',
    v => v !== '',
    'Please select a subject.'
  );
  const isMessageValid = validateField(
    'messageInput', 'messageError',
    v => v.length >= 15,
    'Please enter a message (at least 15 characters).'
  );

  if (isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid) {
    // Simulate form submission
    this.textContent = 'Sending...';
    this.disabled = true;

    setTimeout(() => {
      showToast('Message sent! We will get back to you soon.');

      // Reset form
      ['fullName','emailInput','phoneInput','subjectInput','messageInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      this.textContent = 'Send Message';
      this.disabled = false;
    }, 1200);
  }
});

/* =============================================
   HERO "SHOP NOW" and CTA scrolling
   ============================================= */
// Already covered by smooth scroll handler above for <a href="#..."> links.
// Buttons with no href are handled inline below.

/* =============================================
   OFFER CARDS – "Shop Vegetables" filter shortcut
   ============================================= */
document.querySelectorAll('.btn-offer').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        // Also filter to vegetables if first offer
        if (this.textContent.trim().toLowerCase().includes('vegetable')) {
          const vegCard = document.querySelector('[data-filter="vegetables"]');
          if (vegCard) vegCard.click();
        }
      }
    }
  });
});

/* =============================================
   HERO SECTION PARALLAX (subtle)
   ============================================= */
const heroImg = document.querySelector('.hero-img-frame img');
if (heroImg) {
  window.addEventListener('scroll', function () {
    if (window.scrollY < 600) {
      heroImg.style.transform = `translateY(${window.scrollY * 0.08}px)`;
    }
  }, { passive: true });
}

/* =============================================
   KEYBOARD ACCESSIBILITY – close overlays on Escape
   ============================================= */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeCart();
    closeSearch();
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

/* =============================================
   INIT
   ============================================= */
(function init() {
  updateCartCount();
  renderCartItems();
  // Trigger reveal for above-fold elements
  document.querySelectorAll('.hero .reveal').forEach(el => {
    el.style.transitionDelay = '0.2s';
    setTimeout(() => el.classList.add('visible'), 100);
  });
})();
