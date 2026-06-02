'use strict';

/* ========================================================================== */
/* Navigation (burger menu)                                                   */
/* ========================================================================== */

function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');

  if (!nav || !toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('main-nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ========================================================================== */
/* Advantages tabs                                                            */
/* ========================================================================== */

function initTabs() {
  const root = document.querySelector('[data-tabs]');

  if (!root) {
    return;
  }

  const tabs = root.querySelectorAll('[data-tab]');
  const panels = root.querySelectorAll('[data-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;

      tabs.forEach((item) => {
        item.classList.toggle('advantages-tab-current', item === tab);
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.panel === name;
        panel.classList.toggle('advantages-panel-current', isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

/* ========================================================================== */
/* Product slider                                                             */
/* ========================================================================== */

function initSlider() {
  const slider = document.querySelector('[data-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-slide-to]'));
  const prev = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');

  if (slides.length <= 1) {
    return;
  }

  let current = 0;

  const render = () => {
    slides.forEach((slide, index) => {
      const isActive = index === current;
      slide.classList.toggle('slider-slide-current', isActive);
      slide.hidden = !isActive;
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('slider-pagination-button-current', index === current);
    });
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    render();
  };

  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  render();
}

/* ========================================================================== */
/* Cart store (items persisted in localStorage)                               */
/* ========================================================================== */

const CART_KEY = 'device-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCartCount();
  renderCartModal();
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function addToCart(product) {
  const items = getCart();
  const existing = items.find((item) => item.title === product.title);

  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ title: product.title, price: product.price, image: product.image, qty: 1 });
  }

  saveCart(items);
}

function setQty(title, qty) {
  let items = getCart();
  const item = items.find((entry) => entry.title === title);

  if (!item) {
    return;
  }

  item.qty = qty;

  if (item.qty <= 0) {
    items = items.filter((entry) => entry.title !== title);
  }

  saveCart(items);
}

function removeFromCart(title) {
  saveCart(getCart().filter((item) => item.title !== title));
}

function renderCartCount() {
  const count = cartCount();

  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

/* ========================================================================== */
/* Toasts                                                                     */
/* ========================================================================== */

function showToast(message) {
  const wrap = document.querySelector('[data-toasts]');

  if (!wrap) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  wrap.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ========================================================================== */
/* Modal infrastructure (injected once, shared by both pages)                 */
/* ========================================================================== */

let activeModal = null;
let lastFocused = null;
let currentQuickProduct = null;

function modalShell(name, labelId, bodyHTML, extraClass = '') {
  return `
    <div class="modal ${extraClass}" data-modal="${name}" hidden>
      <div class="modal-overlay" data-modal-close></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="${labelId}">
        <button class="modal-close" type="button" data-modal-close aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>
        </button>
        ${bodyHTML}
      </div>
    </div>`;
}

function buildModals() {
  if (document.querySelector('[data-modals]')) {
    return;
  }

  const loginBody = `
    <form class="modal-form auth-form" novalidate>
      <h2 class="modal-title" id="login-title">Log in</h2>
      <p class="modal-subtitle">Welcome back to Device.</p>
      <label class="field">
        <span class="field-label">Email</span>
        <input class="field-input" type="email" name="email" required placeholder="you@example.com" autocomplete="email">
        <span class="field-error" data-error></span>
      </label>
      <label class="field">
        <span class="field-label">Password</span>
        <input class="field-input" type="password" name="password" required minlength="6" placeholder="At least 6 characters" autocomplete="current-password">
        <span class="field-error" data-error></span>
      </label>
      <button class="button modal-submit" type="submit">Log in</button>
      <p class="modal-alt">No account yet? <a href="#">Create one</a></p>
    </form>`;

  const cartBody = `
    <div class="cart-modal">
      <h2 class="modal-title" id="cart-title">Your cart</h2>
      <ul class="cart-items reset-list" data-cart-items></ul>
      <p class="cart-empty-msg" data-cart-empty>Your cart is empty — add some gadgets!</p>
      <div class="cart-summary" data-cart-summary hidden>
        <span class="cart-total">Total: <strong data-cart-total>$0</strong></span>
        <button class="button cart-checkout" type="button" data-cart-checkout>Checkout</button>
      </div>
    </div>`;

  const quickviewBody = `
    <div class="quickview">
      <div class="quickview-media">
        <img class="quickview-image" data-qv-image src="" alt="" width="320" height="320">
      </div>
      <div class="quickview-info">
        <h2 class="modal-title" id="quickview-title" data-qv-title></h2>
        <p class="quickview-price" data-qv-price></p>
        <p class="quickview-desc" data-qv-desc></p>
        <dl class="quickview-specs" data-qv-specs></dl>
        <button class="button quickview-add" type="button" data-qv-add>Add to cart</button>
      </div>
    </div>`;

  const root = document.createElement('div');
  root.setAttribute('data-modals', '');
  root.innerHTML =
    modalShell('login', 'login-title', loginBody, 'modal-login') +
    modalShell('cart', 'cart-title', cartBody, 'modal-cart') +
    modalShell('quickview', 'quickview-title', quickviewBody, 'modal-quickview');
  document.body.appendChild(root);

  const toasts = document.createElement('div');
  toasts.className = 'toasts';
  toasts.setAttribute('data-toasts', '');
  toasts.setAttribute('aria-live', 'polite');
  document.body.appendChild(toasts);
}

function getFocusable(modal) {
  return Array.from(
    modal.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null);
}

function openModal(name) {
  const modal = document.querySelector(`[data-modal="${name}"]`);

  if (!modal) {
    return;
  }

  if (name === 'cart') {
    renderCartModal();
  }

  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => modal.classList.add('modal-open'));
  activeModal = modal;

  setTimeout(() => {
    const focusables = getFocusable(modal);
    const target = focusables.find((el) => el.tagName === 'INPUT') || focusables[0];
    target?.focus();
  }, 60);
}

function closeModal() {
  if (!activeModal) {
    return;
  }

  const modal = activeModal;
  activeModal = null;
  modal.classList.remove('modal-open');
  document.body.classList.remove('no-scroll');

  setTimeout(() => {
    if (!modal.classList.contains('modal-open')) {
      modal.hidden = true;
    }
  }, 260);

  lastFocused?.focus();
}

function trapFocus(event) {
  if (!activeModal) {
    return;
  }

  const focusables = getFocusable(activeModal);

  if (!focusables.length) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ========================================================================== */
/* Cart modal rendering                                                       */
/* ========================================================================== */

function renderCartModal() {
  const list = document.querySelector('[data-cart-items]');

  if (!list) {
    return;
  }

  const items = getCart();
  const empty = document.querySelector('[data-cart-empty]');
  const summary = document.querySelector('[data-cart-summary]');
  const total = document.querySelector('[data-cart-total]');

  list.innerHTML = items
    .map(
      (item) => `
      <li class="cart-item" data-cart-item="${item.title}">
        <img class="cart-item-image" src="${item.image}" alt="" width="56" height="56">
        <div class="cart-item-info">
          <span class="cart-item-title">${item.title}</span>
          <span class="cart-item-price">$${item.price}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" type="button" data-qty-dec aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" type="button" data-qty-inc aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item-remove" type="button" data-cart-remove aria-label="Remove ${item.title}">✕</button>
      </li>`
    )
    .join('');

  if (empty) {
    empty.hidden = items.length > 0;
  }
  if (summary) {
    summary.hidden = items.length === 0;
  }
  if (total) {
    total.textContent = `$${cartTotal()}`;
  }
}

/* ========================================================================== */
/* Quick view                                                                 */
/* ========================================================================== */

function openQuickview(product) {
  const modal = document.querySelector('[data-modal="quickview"]');

  if (!modal) {
    return;
  }

  currentQuickProduct = { title: product.title, price: product.price, image: product.image };

  const image = modal.querySelector('[data-qv-image]');
  image.src = product.image;
  image.alt = product.title;
  modal.querySelector('[data-qv-title]').textContent = product.title;
  modal.querySelector('[data-qv-price]').textContent = `$${product.price}`;
  modal.querySelector('[data-qv-desc]').textContent = product.desc || '';
  modal.querySelector('[data-qv-specs]').innerHTML = (product.specs || [])
    .map((spec) => `<div class="quickview-spec"><dt>${spec.name}</dt><dd>${spec.value}</dd></div>`)
    .join('');

  openModal('quickview');
}

function openQuickviewFromCatalog(title) {
  const product = PRODUCTS.find((entry) => entry.title === title);

  if (!product) {
    return;
  }

  const colors = product.colors.map((color) => color[0].toUpperCase() + color.slice(1)).join(', ');

  openQuickview({
    title: product.title,
    price: product.price,
    image: `./img/product-img/product-${product.image}.jpg`,
    desc: `A dependable ${product.title.toLowerCase()} for sharp, steady selfies and group shots — extends in seconds and folds down to pocket size.`,
    specs: [
      { name: 'Colors', value: colors },
      { name: 'Bluetooth remote', value: product.bluetooth ? 'Yes' : 'No' },
      { name: 'Warranty', value: '24 months' }
    ]
  });
}

function initSliderQuickview() {
  const slider = document.querySelector('[data-slider]');

  if (!slider) {
    return;
  }

  slider.addEventListener('click', (event) => {
    const button = event.target.closest('.slider-button-details');

    if (!button) {
      return;
    }

    event.preventDefault();
    const slide = button.closest('[data-slide]');

    openQuickview({
      title: slide.querySelector('.slider-title').textContent.trim(),
      price: Number(slide.dataset.productPrice),
      image: slide.querySelector('.slider-image').getAttribute('src'),
      desc: slide.querySelector('.slider-description').textContent.trim(),
      specs: Array.from(slide.querySelectorAll('.specs-item')).map((spec) => ({
        name: spec.querySelector('.specs-name').textContent.trim(),
        value: spec.querySelector('.specs-value').textContent.trim()
      }))
    });
  });
}

/* ========================================================================== */
/* Global interactions: modals, cart actions, login                          */
/* ========================================================================== */

function flashAdded(button) {
  if (!button || button.dataset.qvAdd !== undefined) {
    return;
  }

  if (!button.dataset.label) {
    button.dataset.label = button.textContent;
  }

  button.textContent = 'Added ✓';
  button.classList.add('product-card-add-done');
  clearTimeout(button.flashTimer);
  button.flashTimer = setTimeout(() => {
    button.textContent = button.dataset.label;
    button.classList.remove('product-card-add-done');
  }, 1200);
}

function initInteractions() {
  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-modal-open]');
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.modalOpen);
      return;
    }

    if (event.target.closest('[data-modal-close]')) {
      event.preventDefault();
      closeModal();
      return;
    }

    const quickview = event.target.closest('[data-quickview]');
    if (quickview) {
      event.preventDefault();
      openQuickviewFromCatalog(quickview.dataset.title);
      return;
    }

    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
      event.preventDefault();
      addToCart({
        title: addButton.dataset.title,
        price: Number(addButton.dataset.price),
        image: addButton.dataset.image
      });
      flashAdded(addButton);
      showToast(`Added “${addButton.dataset.title}” to cart`);
      return;
    }

    const qvAdd = event.target.closest('[data-qv-add]');
    if (qvAdd && currentQuickProduct) {
      addToCart(currentQuickProduct);
      showToast(`Added “${currentQuickProduct.title}” to cart`);
      return;
    }

    const cartItemButton = event.target.closest('[data-qty-dec], [data-qty-inc], [data-cart-remove]');
    if (cartItemButton) {
      const row = cartItemButton.closest('[data-cart-item]');
      const title = row.dataset.cartItem;
      const item = getCart().find((entry) => entry.title === title);
      if (!item) {
        return;
      }
      if (cartItemButton.matches('[data-qty-dec]')) {
        setQty(title, item.qty - 1);
      } else if (cartItemButton.matches('[data-qty-inc]')) {
        setQty(title, item.qty + 1);
      } else {
        removeFromCart(title);
      }
      return;
    }

    const checkout = event.target.closest('[data-cart-checkout]');
    if (checkout) {
      if (getCart().length === 0) {
        return;
      }
      saveCart([]);
      closeModal();
      showToast('Order placed! 🎉 Thank you for shopping with Device.');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModal) {
      return;
    }
    if (event.key === 'Escape') {
      closeModal();
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  });

  document.addEventListener('submit', (event) => {
    if (!event.target.classList.contains('auth-form')) {
      return;
    }

    event.preventDefault();
    const form = event.target;
    let valid = true;

    form.querySelectorAll('input').forEach((input) => {
      const error = input.closest('.field').querySelector('[data-error]');
      if (!input.checkValidity()) {
        valid = false;
        error.textContent = input.validationMessage;
        input.classList.add('field-invalid');
      } else {
        error.textContent = '';
        input.classList.remove('field-invalid');
      }
    });

    if (valid) {
      closeModal();
      showToast('Welcome back! 👋');
      form.reset();
    }
  });
}

/* ========================================================================== */
/* Scroll to top                                                              */
/* ========================================================================== */

function initScrollTop() {
  const button = document.createElement('button');
  button.className = 'scroll-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Back to top');
  button.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
  document.body.appendChild(button);

  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const onScroll = () => button.classList.toggle('scroll-top-visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ========================================================================== */
/* Catalog: data-driven products, filters, sorting, pagination                */
/* ========================================================================== */

const PRODUCTS = [
  { title: 'Basic selfie stick', price: 9, image: 1, colors: ['black', 'white'], bluetooth: false, added: 4, popularity: 70 },
  { title: 'Pro selfie stick', price: 19, image: 2, colors: ['black'], bluetooth: true, added: 11, popularity: 95 },
  { title: 'Waterproof selfie stick', price: 29, image: 3, colors: ['black', 'blue'], bluetooth: true, added: 7, popularity: 80 },
  { title: 'Follow-me selfie stick', price: 19, image: 4, colors: ['black', 'white', 'pink'], bluetooth: true, added: 12, popularity: 88 },
  { title: 'Compact selfie stick', price: 12, image: 1, colors: ['white', 'red'], bluetooth: false, added: 2, popularity: 55 },
  { title: 'Tripod selfie stick', price: 24, image: 2, colors: ['black', 'blue'], bluetooth: true, added: 9, popularity: 76 },
  { title: 'Mini selfie stick', price: 7, image: 3, colors: ['pink', 'white'], bluetooth: false, added: 3, popularity: 60 },
  { title: 'Travel selfie stick', price: 15, image: 4, colors: ['black', 'red'], bluetooth: true, added: 10, popularity: 84 },
  { title: 'Premium selfie stick', price: 39, image: 1, colors: ['black'], bluetooth: true, added: 6, popularity: 92 },
  { title: 'Studio selfie stick', price: 34, image: 2, colors: ['white', 'blue'], bluetooth: true, added: 8, popularity: 68 },
  { title: 'Pocket selfie stick', price: 11, image: 3, colors: ['black', 'pink'], bluetooth: false, added: 1, popularity: 50 },
  { title: 'Adventure selfie stick', price: 27, image: 4, colors: ['black', 'red', 'blue'], bluetooth: true, added: 5, popularity: 79 }
];

const PAGE_SIZE = 6;

function initCatalog() {
  const catalog = document.querySelector('[data-catalog]');

  if (!catalog) {
    return;
  }

  const list = catalog.querySelector('[data-products]');
  const empty = catalog.querySelector('[data-products-empty]');
  const moreButton = catalog.querySelector('[data-products-more]');
  const pagination = catalog.querySelector('[data-pagination]');

  const filterForm = document.querySelector('[data-filter]');
  const sortingForm = document.querySelector('[data-sorting]');
  const sortSelect = sortingForm?.querySelector('select');
  const minInput = document.querySelector('[data-range-input-min]');
  const maxInput = document.querySelector('[data-range-input-max]');

  let startPage = 1;
  let endPage = 1;
  let sortOrder = 'asc';

  function readFilters() {
    const colors = filterForm
      ? Array.from(filterForm.querySelectorAll('input[name="color"]:checked')).map((input) => input.value)
      : [];
    const bluetooth = filterForm?.querySelector('input[name="bluetooth"]:checked')?.value ?? null;
    const min = Number(minInput?.value) || 0;
    const max = Number(maxInput?.value) || Infinity;

    return { colors, bluetooth, min, max };
  }

  function applyFilters(products) {
    const { colors, bluetooth, min, max } = readFilters();

    return products.filter((product) => {
      const colorMatch = colors.length === 0 || product.colors.some((color) => colors.includes(color));
      const bluetoothMatch = !bluetooth || product.bluetooth === (bluetooth === 'yes');
      const priceMatch = product.price >= min && product.price <= max;

      return colorMatch && bluetoothMatch && priceMatch;
    });
  }

  function applySorting(products) {
    const key = sortSelect?.value || 'popular';
    const sorted = [...products].sort((a, b) => {
      if (key === 'new') {
        return b.added - a.added;
      }
      if (key === 'discount') {
        return a.price - b.price;
      }
      return b.popularity - a.popularity;
    });

    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }

  function cardMarkup(product) {
    const image = `./img/product-img/product-${product.image}.jpg`;
    return `
      <li class="product-card" data-product>
        <a class="product-card-link link" href="#" data-quickview data-title="${product.title}">
          <div class="product-card-image-wrapper">
            <img class="product-card-image" src="${image}" height="380" width="360" alt="${product.title}" loading="lazy">
            <span class="product-card-quickview">Quick view</span>
          </div>
          <div class="product-card-info">
            <h3 class="product-card-title">${product.title}</h3>
            <span class="product-card-price">$${product.price}</span>
          </div>
        </a>
        <button class="button product-card-add" type="button" data-add-to-cart data-title="${product.title}" data-price="${product.price}" data-image="${image}">Add to cart</button>
      </li>`;
  }

  function renderPagination(totalPages) {
    if (!pagination) {
      return;
    }

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const items = [];
    for (let page = 1; page <= totalPages; page += 1) {
      const isCurrent = page >= startPage && page <= endPage;
      const current = isCurrent ? ' pagination-link-current' : '';
      const aria = page === endPage ? ' aria-current="page"' : '';
      items.push(`<li class="pagination-item"><a class="pagination-link${current} link" href="#" data-page="${page}"${aria}>${page}</a></li>`);
    }

    const prevDisabled = endPage <= 1 ? ' pagination-arrow-disabled' : '';
    const nextDisabled = endPage >= totalPages ? ' pagination-arrow-disabled' : '';

    pagination.innerHTML = `
      <a class="pagination-arrow pagination-arrow-prev${prevDisabled} link" href="#" data-page-step="-1">Prev</a>
      <ul class="pagination-list reset-list">${items.join('')}</ul>
      <a class="pagination-arrow pagination-arrow-next${nextDisabled} link" href="#" data-page-step="1">Next</a>`;
  }

  function render() {
    const filtered = applySorting(applyFilters(PRODUCTS));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    endPage = Math.min(endPage, totalPages);
    startPage = Math.min(startPage, endPage);

    const visible = filtered.slice((startPage - 1) * PAGE_SIZE, endPage * PAGE_SIZE);

    list.innerHTML = visible.map(cardMarkup).join('');
    empty.hidden = filtered.length > 0;
    moreButton.hidden = endPage >= totalPages;

    renderPagination(totalPages);
  }

  function totalPagesNow() {
    return Math.max(1, Math.ceil(applyFilters(PRODUCTS).length / PAGE_SIZE));
  }

  function resetAndRender() {
    startPage = 1;
    endPage = 1;
    render();
  }

  filterForm?.addEventListener('change', resetAndRender);
  filterForm?.addEventListener('input', resetAndRender);
  filterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    resetAndRender();
  });
  sortSelect?.addEventListener('change', resetAndRender);

  sortingForm?.querySelectorAll('[data-sort-order]').forEach((button) => {
    button.addEventListener('click', () => {
      sortOrder = button.dataset.sortOrder;
      sortingForm.querySelectorAll('[data-sort-order]').forEach((item) => {
        item.classList.toggle('sorting-order-button-current', item === button);
      });
      render();
    });
  });

  moreButton.addEventListener('click', () => {
    endPage = Math.min(totalPagesNow(), endPage + 1);
    render();
  });

  pagination?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page], [data-page-step]');
    if (!target) {
      return;
    }
    event.preventDefault();

    const totalPages = totalPagesNow();

    if (target.dataset.page) {
      startPage = endPage = Number(target.dataset.page);
    } else {
      startPage = endPage = Math.min(totalPages, Math.max(1, endPage + Number(target.dataset.pageStep)));
    }

    render();
    list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return { render, resetAndRender };
}

/* ========================================================================== */
/* Price range (dual handle), kept in sync with the catalog                   */
/* ========================================================================== */

function initRange(onChange) {
  const range = document.querySelector('[data-range]');

  if (!range) {
    return;
  }

  const track = range.querySelector('.range-track');
  const progress = range.querySelector('[data-range-progress]');
  const minToggle = range.querySelector('[data-range-min]');
  const maxToggle = range.querySelector('[data-range-max]');
  const minInput = document.querySelector('[data-range-input-min]');
  const maxInput = document.querySelector('[data-range-input-max]');

  if (!track || !progress || !minToggle || !maxToggle || !minInput || !maxInput) {
    return;
  }

  const MIN = 0;
  const MAX = 100;
  const GAP = 1;

  const clamp = (value) => Math.min(MAX, Math.max(MIN, value));

  let minValue = clamp(Number(minInput.value) || MIN);
  let maxValue = clamp(Number(maxInput.value) || MAX);

  function render(notify) {
    const minPercent = (minValue / MAX) * 100;
    const maxPercent = (maxValue / MAX) * 100;

    minToggle.style.left = `${minPercent}%`;
    maxToggle.style.left = `${maxPercent}%`;
    progress.style.left = `${minPercent}%`;
    progress.style.width = `${maxPercent - minPercent}%`;

    minInput.value = String(minValue);
    maxInput.value = String(maxValue);

    if (notify && typeof onChange === 'function') {
      onChange();
    }
  }

  function startDrag(isMin) {
    const onMove = (event) => {
      const point = event.touches ? event.touches[0] : event;
      const rect = track.getBoundingClientRect();
      const ratio = (point.clientX - rect.left) / rect.width;
      const value = clamp(Math.round(ratio * MAX));

      if (isMin) {
        minValue = Math.min(value, maxValue - GAP);
      } else {
        maxValue = Math.max(value, minValue + GAP);
      }

      render(true);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
  }

  minToggle.addEventListener('mousedown', () => startDrag(true));
  minToggle.addEventListener('touchstart', () => startDrag(true), { passive: true });
  maxToggle.addEventListener('mousedown', () => startDrag(false));
  maxToggle.addEventListener('touchstart', () => startDrag(false), { passive: true });

  minInput.addEventListener('change', () => {
    minValue = clamp(Math.min(Number(minInput.value) || MIN, maxValue - GAP));
    render(true);
  });

  maxInput.addEventListener('change', () => {
    maxValue = clamp(Math.max(Number(maxInput.value) || MAX, minValue + GAP));
    render(true);
  });

  render(false);
}

/* ========================================================================== */
/* Bootstrap                                                                  */
/* ========================================================================== */

initNav();
initTabs();
initSlider();

buildModals();
renderCartCount();
initInteractions();
initSliderQuickview();
initScrollTop();

const catalog = initCatalog();
if (catalog) {
  catalog.render();
  initRange(catalog.resetAndRender);
}
