/*!
 * color-fx v1.0.0
 * Color palette generator & CSS theme builder.
 * Zero dependencies. MIT License — https://github.com/hojullc/color-fx
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
    : (global.ColorFx = factory());
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /* ─── Color conversions ─────────────────────────────────────── */
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  }

  function rgbToHsl({ r, g, b }) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
        case gg: h = ((bb - rr) / d + 2) / 6; break;
        default: h = ((rr - gg) / d + 4) / 6;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
      r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
    };
  }

  function parse(color) {
    if (typeof color === 'string' && color.startsWith('#')) return hexToRgb(color);
    if (typeof color === 'object') return color;
    return { r: 128, g: 128, b: 128 };
  }

  /* ─── Palette generators ────────────────────────────────────── */
  function shades(hex, steps = 9) {
    const { h, s } = rgbToHsl(hexToRgb(hex));
    return Array.from({ length: steps }, (_, i) => {
      const l = 95 - (i / (steps - 1)) * 85;
      return rgbToHex(hslToRgb(h, s * 0.9, l));
    });
  }

  function complementary(hex) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return [hex, rgbToHex(hslToRgb((h + 180) % 360, s, l))];
  }

  function triadic(hex) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return [0, 120, 240].map(d => rgbToHex(hslToRgb((h + d) % 360, s, l)));
  }

  function analogous(hex, spread = 30, count = 5) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return Array.from({ length: count }, (_, i) => {
      const angle = h + (i - Math.floor(count / 2)) * spread;
      return rgbToHex(hslToRgb((angle + 360) % 360, s, l));
    });
  }

  function splitComplementary(hex) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return [hex, rgbToHex(hslToRgb((h + 150) % 360, s, l)), rgbToHex(hslToRgb((h + 210) % 360, s, l))];
  }

  function tetradic(hex) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return [0, 90, 180, 270].map(d => rgbToHex(hslToRgb((h + d) % 360, s, l)));
  }

  /* ─── CSS theme builder ──────────────────────────────────────── */
  function buildTheme(hex, opts = {}) {
    const { name = 'primary', darkSurface = '#0f172a' } = opts;
    const palette = shades(hex);
    const css = [
      ':root {',
      `  --${name}-50:  ${palette[0]};`,
      `  --${name}-100: ${palette[1]};`,
      `  --${name}-200: ${palette[2]};`,
      `  --${name}-300: ${palette[3]};`,
      `  --${name}-400: ${palette[4]};`,
      `  --${name}-500: ${palette[5]};`,
      `  --${name}-600: ${palette[6]};`,
      `  --${name}-700: ${palette[7]};`,
      `  --${name}-900: ${palette[8]};`,
      `  --${name}:     ${hex};`,
      '}',
    ].join('\n');
    return css;
  }

  /* ─── Luminance & contrast ───────────────────────────────────── */
  function luminance({ r, g, b }) {
    const [rr, gg, bb] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  }

  function contrast(c1, c2) {
    const l1 = luminance(parse(c1)), l2 = luminance(parse(c2));
    const bright = Math.max(l1, l2), dark = Math.min(l1, l2);
    return (bright + 0.05) / (dark + 0.05);
  }

  function wcag(fg, bg) {
    const r = contrast(fg, bg);
    return {
      ratio: +r.toFixed(2),
      aa:    r >= 4.5,
      aaLarge: r >= 3,
      aaa:   r >= 7,
    };
  }

  /* ─── Color mixing ───────────────────────────────────────────── */
  function mix(c1, c2, t = 0.5) {
    const a = parse(c1), b = parse(c2);
    return rgbToHex({
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    });
  }

  function lighten(hex, amount = 10) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return rgbToHex(hslToRgb(h, s, Math.min(100, l + amount)));
  }

  function darken(hex, amount = 10) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return rgbToHex(hslToRgb(h, s, Math.max(0, l - amount)));
  }

  function saturate(hex, amount = 10) {
    const { h, s, l } = rgbToHsl(hexToRgb(hex));
    return rgbToHex(hslToRgb(h, Math.min(100, s + amount), l));
  }

  /* ─── Random harmonious palette ─────────────────────────────── */
  function random(mode = 'analogous') {
    const h = Math.random() * 360;
    const s = 55 + Math.random() * 25;
    const l = 50 + Math.random() * 10;
    const hex = rgbToHex(hslToRgb(h, s, l));
    const fns = { analogous, triadic, tetradic, complementary, 'split-complementary': splitComplementary };
    return (fns[mode] || analogous)(hex);
  }

  /* ─── Widget ─────────────────────────────────────────────────── */
  function widget(container, opts = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const { mode = 'shades', onChange = () => {} } = opts;

    const update = (hex) => {
      let palette;
      switch (mode) {
        case 'complementary':       palette = complementary(hex);       break;
        case 'triadic':             palette = triadic(hex);             break;
        case 'analogous':           palette = analogous(hex);           break;
        case 'split-complementary': palette = splitComplementary(hex);  break;
        case 'tetradic':            palette = tetradic(hex);            break;
        default:                    palette = shades(hex);              break;
      }
      el.innerHTML = '';
      palette.forEach(c => {
        const swatch = document.createElement('div');
        swatch.title = c;
        swatch.style.cssText = `
          flex:1;min-width:40px;height:80px;border-radius:8px;cursor:pointer;
          background:${c};transition:transform .15s;
        `;
        swatch.addEventListener('mouseenter', () => swatch.style.transform = 'scaleY(1.08)');
        swatch.addEventListener('mouseleave', () => swatch.style.transform = '');
        swatch.addEventListener('click', () => { navigator.clipboard?.writeText(c); onChange(c, palette); });
        el.appendChild(swatch);
      });
      return palette;
    };

    return { update };
  }

  return {
    hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
    shades, complementary, triadic, analogous, splitComplementary, tetradic,
    buildTheme, contrast, wcag, mix, lighten, darken, saturate, random, widget,
  };
}));
