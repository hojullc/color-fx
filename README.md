# color-fx

> Color palette generator and CSS theme builder. Harmonious palettes, WCAG contrast, CSS export. Zero dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Install

```html
<script src="https://cdn.jsdelivr.net/gh/hojullc/color-fx@1/src/color-fx.js"></script>
```

## Features

| Function | Description |
|----------|-------------|
| `shades(hex, steps)` | 9-step tint/shade scale |
| `complementary(hex)` | Opposite hue palette |
| `triadic(hex)` | Three-way harmony |
| `analogous(hex)` | Adjacent hue palette |
| `buildTheme(hex)` | CSS custom properties export |
| `wcag(fg, bg)` | WCAG AA/AAA contrast check |
| `mix(c1, c2, t)` | Color lerp |
| `lighten/darken` | HSL adjustments |
| `random(mode)` | Random harmonious palette |
| `widget(container)` | Interactive swatch panel |

## Quick start

```js
// Generate a 9-step palette
const swatches = ColorFx.shades('#7064ff');

// Check WCAG contrast
const result = ColorFx.wcag('#ffffff', '#0f172a');
// { ratio: 16.1, aa: true, aaa: true }

// Export CSS theme
const css = ColorFx.buildTheme('#7064ff');
// :root { --primary-50: #f0eeff; ... --primary-900: #1a0a7a; }

// Interactive widget
ColorFx.widget('#palette-container', { mode: 'triadic' });
```

## License

MIT (c) Hoju LLC https://hoju.us
