'use strict';

/**
 * Mobile navigation toggle (burger menu).
 */
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

/**
 * Tabbed "advantages" block: switch active tab and panel.
 */
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

/**
 * Product slider: previous / next arrows and pagination dots.
 */
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

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  render();
}

/**
 * Dual-handle price range that stays in sync with the number inputs.
 */
function initRange() {
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

  let minValue = clamp(Number(minInput.value) || MIN);
  let maxValue = clamp(Number(maxInput.value) || MAX);

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  function render() {
    const minPercent = (minValue / MAX) * 100;
    const maxPercent = (maxValue / MAX) * 100;

    minToggle.style.left = `${minPercent}%`;
    maxToggle.style.left = `${maxPercent}%`;
    progress.style.left = `${minPercent}%`;
    progress.style.width = `${maxPercent - minPercent}%`;

    minInput.value = String(minValue);
    maxInput.value = String(maxValue);
  }

  function startDrag(toggle, isMin) {
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

      render();
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

  minToggle.addEventListener('mousedown', () => startDrag(minToggle, true));
  minToggle.addEventListener('touchstart', () => startDrag(minToggle, true), { passive: true });
  maxToggle.addEventListener('mousedown', () => startDrag(maxToggle, false));
  maxToggle.addEventListener('touchstart', () => startDrag(maxToggle, false), { passive: true });

  minInput.addEventListener('change', () => {
    minValue = clamp(Math.min(Number(minInput.value) || MIN, maxValue - GAP));
    render();
  });

  maxInput.addEventListener('change', () => {
    maxValue = clamp(Math.max(Number(maxInput.value) || MAX, minValue + GAP));
    render();
  });

  render();
}

/**
 * Sorting direction toggle (ascending / descending).
 */
function initSorting() {
  const sorting = document.querySelector('[data-sorting]');

  if (!sorting) {
    return;
  }

  const buttons = sorting.querySelectorAll('[data-sort-order]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => {
        item.classList.toggle('sorting-order-button-current', item === button);
      });
    });
  });
}

initNav();
initTabs();
initSlider();
initRange();
initSorting();
