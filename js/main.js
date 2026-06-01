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
/* Cart (shared across pages, persisted in localStorage)                      */
/* ========================================================================== */

const CART_KEY = 'device-cart-count';

function getCartCount() {
  return Number(localStorage.getItem(CART_KEY)) || 0;
}

function setCartCount(count) {
  localStorage.setItem(CART_KEY, String(count));
  renderCartCount();
}

function renderCartCount() {
  const count = getCartCount();

  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function initCart() {
  renderCartCount();

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-to-cart]');

    if (addButton) {
      event.preventDefault();
      setCartCount(getCartCount() + 1);
      addButton.classList.add('product-card-add-done');
      addButton.textContent = 'Added ✓';
      setTimeout(() => {
        addButton.classList.remove('product-card-add-done');
        addButton.textContent = 'Add to cart';
      }, 1200);
    }
  });
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

  let pagesShown = 1;
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
    return `
      <li class="product-card" data-product>
        <a class="product-card-link link" href="#">
          <div class="product-card-image-wrapper">
            <img class="product-card-image" src="./img/product-img/product-${product.image}.jpg" height="380" width="360" alt="${product.title}" loading="lazy">
          </div>
          <div class="product-card-info">
            <h3 class="product-card-title">${product.title}</h3>
            <span class="product-card-price">$${product.price}</span>
          </div>
        </a>
        <button class="button product-card-add" type="button" data-add-to-cart>Add to cart</button>
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
      const current = page === pagesShown ? ' pagination-link-current' : '';
      const aria = page === pagesShown ? ' aria-current="page"' : '';
      items.push(`<li class="pagination-item"><a class="pagination-link${current} link" href="#" data-page="${page}"${aria}>${page}</a></li>`);
    }

    const prevDisabled = pagesShown === 1 ? ' pagination-arrow-disabled' : '';
    const nextDisabled = pagesShown === totalPages ? ' pagination-arrow-disabled' : '';

    pagination.innerHTML = `
      <a class="pagination-arrow pagination-arrow-prev${prevDisabled} link" href="#" data-page-step="-1">Prev</a>
      <ul class="pagination-list reset-list">${items.join('')}</ul>
      <a class="pagination-arrow pagination-arrow-next${nextDisabled} link" href="#" data-page-step="1">Next</a>`;
  }

  function render() {
    const filtered = applySorting(applyFilters(PRODUCTS));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    pagesShown = Math.min(pagesShown, totalPages);

    const visible = filtered.slice(0, pagesShown * PAGE_SIZE);

    list.innerHTML = visible.map(cardMarkup).join('');
    empty.hidden = filtered.length > 0;
    moreButton.hidden = pagesShown >= totalPages;

    renderPagination(totalPages);
  }

  function resetAndRender() {
    pagesShown = 1;
    render();
  }

  // Live filtering + sorting.
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
    pagesShown += 1;
    render();
  });

  pagination?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page], [data-page-step]');
    if (!target) {
      return;
    }
    event.preventDefault();

    const totalPages = Math.max(1, Math.ceil(applyFilters(PRODUCTS).length / PAGE_SIZE));

    if (target.dataset.page) {
      pagesShown = Number(target.dataset.page);
    } else {
      pagesShown = Math.min(totalPages, Math.max(1, pagesShown + Number(target.dataset.pageStep)));
    }

    render();
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
initCart();

const catalog = initCatalog();
if (catalog) {
  catalog.render();
  initRange(catalog.resetAndRender);
}
