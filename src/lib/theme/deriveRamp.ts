export type RampStep = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700';

export type Ramp = Record<RampStep, string>;

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const DEFAULT_BASE = '#FBB6D8';

const DEFAULT_RAMP_LIGHT: Ramp = {
  '50': '#FFF3F9',
  '100': '#FFE8F4',
  '200': '#FDD4E8',
  '300': '#FBB6D8',
  '400': '#F9AAD1',
  '500': '#F09FC8',
  '600': '#EA82BB',
  '700': '#A03D7A',
};

const DEFAULT_RAMP_DARK: Ramp = {
  '50': '#241419',
  '100': '#331D26',
  '200': '#4A2A36',
  '300': '#FBB6D8',
  '400': '#FDC9E2',
  '500': '#F09FC8',
  '600': '#EA82BB',
  '700': '#F7C4DF',
};

export const WHITE = '#FFFFFF';
export const DARK_BG = '#141011';
export const TEXT_PRIMARY = '#2B1A18';
export const AA_CONTRAST = 4.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(hex: string): string {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  return `#${full.toUpperCase()}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const part = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${part(r)}${part(g)}${part(b)}`;
}

export function hexToHsl(hex: string): Hsl {
  const [r255, g255, b255] = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }

  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lum = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;

  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function darkenUntilReadable(h: number, s: number, l: number, bg: string, target: number): string {
  let lightness = clamp(l, 0, 100);
  let hex = hslToHex(h, s, lightness);
  while (contrastRatio(hex, bg) < target && lightness > 0) {
    lightness = Math.max(0, lightness - 0.5);
    hex = hslToHex(h, s, lightness);
  }
  return hex;
}

function lightenUntilReadable(h: number, s: number, l: number, bg: string, target: number): string {
  let lightness = clamp(l, 0, 100);
  let hex = hslToHex(h, s, lightness);
  while (contrastRatio(hex, bg) < target && lightness < 100) {
    lightness = Math.min(100, lightness + 0.5);
    hex = hslToHex(h, s, lightness);
  }
  return hex;
}

export type SurfaceKey =
  | 'grad-top'
  | 'grad-btm'
  | 'surface'
  | 'surface-secondary'
  | 'card'
  | 'card-done'
  | 'elevated'
  | 'chip'
  | 'border'
  | 'border-strong';

export type Surfaces = Record<SurfaceKey, string>;

export const TEXT_TERTIARY = '#7A7072';
export const DARK_TEXT_TERTIARY = '#949092';

const DEFAULT_SURFACES_LIGHT: Surfaces = {
  'grad-top': '#FFE8F4',
  'grad-btm': '#FFF2F8',
  surface: '#FEF4F9',
  'surface-secondary': '#FFEDF6',
  card: '#FEF4F9',
  'card-done': '#FDF2F7',
  elevated: '#FEF4F9',
  chip: '#FFDCEE',
  border: '#FBD3E7',
  'border-strong': '#F5BDD9',
};

const DEFAULT_SURFACES_DARK: Surfaces = {
  'grad-top': '#1D1319',
  'grad-btm': '#141011',
  surface: '#282022',
  'surface-secondary': '#231A1F',
  card: '#282022',
  'card-done': '#1F1A1C',
  elevated: '#2E2528',
  chip: '#3E2531',
  border: '#3A2E34',
  'border-strong': '#4D3D45',
};

function readableSurface(h: number, s: number, l: number, text: string, target: number, isDark: boolean): string {
  let lightness = clamp(l, 0, 100);
  let hex = hslToHex(h, s, lightness);
  while (contrastRatio(hex, text) < target && lightness > 0 && lightness < 100) {
    lightness = isDark ? Math.max(0, lightness - 0.5) : Math.min(100, lightness + 0.5);
    hex = hslToHex(h, s, lightness);
  }
  return hex;
}

export function surfaceTarget(key: SurfaceKey, isDark: boolean): number {
  const reference = (isDark ? DEFAULT_SURFACES_DARK : DEFAULT_SURFACES_LIGHT)[key];
  return Math.min(AA_CONTRAST, contrastRatio(reference, isDark ? DARK_TEXT_TERTIARY : TEXT_TERTIARY));
}

export function deriveSurfaces(baseColor: string, isDark: boolean): Surfaces {
  const base = normalizeHex(baseColor);

  if (base === DEFAULT_BASE) {
    return { ...(isDark ? DEFAULT_SURFACES_DARK : DEFAULT_SURFACES_LIGHT) };
  }

  const { h, s } = hexToHsl(base);

  if (isDark) {
    const tone = (key: SurfaceKey, ratio: number, l: number) =>
      readableSurface(h, s * ratio, l, DARK_TEXT_TERTIARY, surfaceTarget(key, true), true);
    const surface = tone('surface', 0.12, 14.1);
    return {
      'grad-top': tone('grad-top', 0.23, 9.4),
      'grad-btm': tone('grad-btm', 0.12, 7.1),
      surface,
      'surface-secondary': tone('surface-secondary', 0.17, 12),
      card: surface,
      'card-done': tone('card-done', 0.1, 11.2),
      elevated: tone('elevated', 0.12, 16.3),
      chip: tone('chip', 0.28, 19.4),
      border: hslToHex(h, s * 0.13, 20.4),
      'border-strong': hslToHex(h, s * 0.13, 27.1),
    };
  }

  const vivid = Math.min(s * 1.12, 100);
  const tone = (key: SurfaceKey, sat: number, l: number) =>
    readableSurface(h, sat, l, TEXT_TERTIARY, surfaceTarget(key, false), false);
  const surface = tone('surface', s * 0.93, 97.6);
  return {
    'grad-top': tone('grad-top', vivid, 95.5),
    'grad-btm': tone('grad-btm', vivid, 97.5),
    surface,
    'surface-secondary': tone('surface-secondary', vivid, 96.5),
    card: surface,
    'card-done': tone('card-done', s * 0.82, 97.1),
    elevated: surface,
    chip: tone('chip', vivid, 93.1),
    border: hslToHex(h, s * 0.93, 90.6),
    'border-strong': hslToHex(h, s * 0.82, 85.1),
  };
}

export function deriveRamp(baseColor: string, isDark: boolean): Ramp {
  const base = normalizeHex(baseColor);

  if (base === DEFAULT_BASE) {
    return { ...(isDark ? DEFAULT_RAMP_DARK : DEFAULT_RAMP_LIGHT) };
  }

  const { h, s, l } = hexToHsl(base);

  if (isDark) {
    return {
      '50': hslToHex(h, Math.min(s * 0.4, 35), 11),
      '100': hslToHex(h, Math.min(s * 0.3, 30), 15),
      '200': hslToHex(h, Math.min(s * 0.3, 30), 22),
      '300': base,
      '400': hslToHex(h, s, l + 4),
      '500': hslToHex(h, s * 0.81, l - 7),
      '600': hslToHex(h, s * 0.79, l - 13.5),
      '700': lightenUntilReadable(h, s * 0.8, l + 2, DARK_BG, AA_CONTRAST),
    };
  }

  return {
    '50': hslToHex(h, Math.min(s * 1.1, 100), 97.5),
    '100': hslToHex(h, Math.min(s * 1.1, 100), 95.5),
    '200': hslToHex(h, Math.min(s * 1.02, 95), 91),
    '300': base,
    '400': hslToHex(h, s * 0.97, l - 3),
    '500': hslToHex(h, s * 0.81, l - 7),
    '600': hslToHex(h, s * 0.79, l - 13.5),
    '700': darkenUntilReadable(h, s * 0.5, l - 41.5, deriveSurfaces(base, false).chip, AA_CONTRAST),
  };
}
