# Device — Online Gadget Store

A responsive, multi-page front-end for a fictional gadget store, built from scratch
with semantic HTML, modern CSS and vanilla JavaScript — no frameworks, no build step.

🔗 **Live demo:** https://usachevdev.github.io/htmlacademy-htmlcss-device/

## Highlights

- **Fully responsive** — mobile-first layout with three breakpoints (mobile, tablet, desktop ≥ 1200px).
- **Vanilla JavaScript interactivity**, written without dependencies:
  - product slider with arrows and pagination dots;
  - tabbed "advantages" section;
  - **data-driven catalog** with live filtering (color, price range, Bluetooth),
    sorting (popularity / new / price, ascending & descending), and
    "show more" + pagination;
  - **shopping cart** with an add-to-cart action and a header counter persisted
    in `localStorage` across pages;
  - dual-handle price range slider synced with the number inputs;
  - accessible mobile burger menu.
- **Accessible & semantic** — landmark elements, `aria` attributes, visually-hidden labels,
  keyboard-focus styles and correct heading order.
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
