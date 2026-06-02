# Device — Online Gadget Store

A responsive, multi-page front-end for a fictional gadget store, built from scratch
with semantic HTML, modern CSS and vanilla JavaScript — no frameworks, no build step.

🔗 **Live demo:** https://usachevdev.github.io/htmlacademy-htmlcss-device/

## Highlights

- **Fully responsive** — mobile-first layout with three breakpoints (mobile, tablet, desktop ≥ 1200px).
- **Vanilla JavaScript interactivity**, written without dependencies:
  - product slider with arrows and pagination dots;
  - tabbed "advantages" section;
  - **data-driven, category-aware catalog** — each category card opens its own
    catalog view (`?category=`) with its products, title and breadcrumb; live
    filtering (color, price range, Bluetooth), sorting (popularity / new / price,
    ascending & descending), and "show more" + pagination;
  - **shopping cart** built as a real store in `localStorage`: add to cart, a
    mini-cart modal with quantity steppers, remove, live total and checkout;
  - **accessible modals** (cart, login, contact, product quick view) with focus
    trapping, `Esc`-to-close, scroll lock and `aria` dialog roles — injected once
    and shared across pages;
  - **every control is wired up** — smooth-scroll in-page navigation, working
    search, newsletter and contact forms with validation, and friendly toast
    feedback for demo-only actions (no dead `#` links);
  - **login & contact forms** with native constraint validation and inline errors;
  - **quick view** of any product from the catalog cards or the hero slider;
  - **toast notifications** and tasteful micro-interactions (card hover, a
    back-to-top button), all respecting `prefers-reduced-motion`;
  - hero slider with **autoplay** (pauses on hover/focus), **touch swipe** and
    arrow-key control;
  - **URL-driven search** — the header search sends `?q=` to the catalog, which
    pre-fills the field and filters products (with a friendly empty state);
  - dual-handle price range slider — fully **keyboard-operable** (`role="slider"`,
    arrows / Home / End, live `aria-valuenow`) and synced with the number inputs;
  - accessible mobile burger menu.
- **Accessible & semantic** — landmark elements, `aria` attributes, visually-hidden labels,
  visible `:focus-visible` rings, focus-trapped dialogs, a keyboard-operable custom
  slider, correct heading order and `prefers-reduced-motion` support.
- **Share-ready SEO** — per-page `<title>`/`description`, Open Graph & Twitter Card
  tags with a generated 1200×630 preview image, `theme-color`, and a custom 404 page.
- **Maintainable CSS** — CSS custom properties for the design tokens, a single fluid
  container helper, and clearly sectioned, lint-friendly styles.
- **Performance-minded** — `woff2` fonts with `font-display: swap` and `<link rel="preload">`,
  inline SVG icons, and an SVG favicon.

## Tech stack

- HTML5
- CSS3 (Flexbox, Grid, custom properties, media queries)
- JavaScript (ES6+, no libraries)

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Landing page: hero slider, category grid, advantages tabs, info & newsletter blocks. |
| `catalog.html` | Catalog page: sidebar filters (price range, color, Bluetooth), sorting and a product grid. |

## Project structure

```
.
├── index.html          # Landing page
├── catalog.html        # Catalog page
├── css/
│   └── styles.css      # All styles (mobile-first, custom properties, 3 breakpoints)
├── js/
│   └── main.js         # All interactivity (no dependencies)
├── img/                # Logos, product images, inline-SVG favicon
└── fonts/              # Rubik & Raleway (woff2)
```

## Run locally

The project is fully static — any HTTP server works:

```bash
# Python 3
python -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

## Credits

The visual design is based on the **"Device"** training layout by
[HTML Academy](https://htmlacademy.ru/). All markup, styles and JavaScript in this
repository were written by me; the project was then refactored and extended with
responsive layouts, interactivity and accessibility improvements as a portfolio piece.
