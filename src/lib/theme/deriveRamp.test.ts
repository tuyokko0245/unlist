import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AA_CONTRAST,
  DARK_BG,
  TEXT_PRIMARY,
  WHITE,
  contrastRatio,
  deriveRamp,
  deriveSurfaces,
  surfaceTarget,
  DARK_TEXT_TERTIARY,
  TEXT_TERTIARY,
  hexToHsl,
  hslToHex,
  normalizeHex,
} from './deriveRamp.ts';
import { DEFAULT_BASE_COLOR, PALETTE_20 } from '../../constants/palette.ts';

const DEFAULT_RAMP_LIGHT = {
  '50': '#FFF3F9',
  '100': '#FFE8F4',
  '200': '#FDD4E8',
  '300': '#FBB6D8',
  '400': '#F9AAD1',
  '500': '#F09FC8',
  '600': '#EA82BB',
  '700': '#A03D7A',
};

test('デフォルトカラーのライトランプは設計書§1.1の値をそのまま返す', () => {
  assert.deepEqual(deriveRamp(DEFAULT_BASE_COLOR, false), DEFAULT_RAMP_LIGHT);
});

test('デフォルトカラーのダークランプは設計書§1.1の値をそのまま返す', () => {
  assert.deepEqual(deriveRamp(DEFAULT_BASE_COLOR, true), {
    '50': '#241419',
    '100': '#331D26',
    '200': '#4A2A36',
    '300': '#FBB6D8',
    '400': '#FDC9E2',
    '500': '#F09FC8',
    '600': '#EA82BB',
    '700': '#F7C4DF',
  });
});

test('ハッシュなし・小文字・3桁の指定を同じランプとして扱う', () => {
  assert.deepEqual(deriveRamp('fbb6d8', false), DEFAULT_RAMP_LIGHT);
  assert.equal(normalizeHex('#fff'), '#FFFFFF');
});

test('HSL往復変換が元の hex に戻る', () => {
  for (const color of PALETTE_20) {
    const { h, s, l } = hexToHsl(color.light);
    assert.equal(hslToHex(h, s, l), normalizeHex(color.light), color.name);
  }
});

test('コントラスト比の計算が既知の値と一致する', () => {
  assert.equal(Math.round(contrastRatio(WHITE, '#000000')), 21);
  assert.ok(Math.abs(contrastRatio('#A03D7A', WHITE) - 6.1) < 0.1);
  assert.ok(Math.abs(contrastRatio('#FBB6D8', TEXT_PRIMARY) - 10.2) < 0.1);
});

test('20色すべてで base-700 が白背景に対して AA（4.5:1）を満たす', () => {
  for (const color of PALETTE_20) {
    const ramp = deriveRamp(color.light, false);
    const ratio = contrastRatio(ramp['700'], WHITE);
    assert.ok(
      ratio >= AA_CONTRAST,
      `${color.name} (${color.light}) → base-700 ${ramp['700']} = ${ratio.toFixed(2)}:1`,
    );
  }
});

test('20色すべてで base-300 が主要テキスト色に対して AA（4.5:1）を満たす', () => {
  for (const color of PALETTE_20) {
    const ramp = deriveRamp(color.light, false);
    const ratio = contrastRatio(ramp['300'], TEXT_PRIMARY);
    assert.ok(
      ratio >= AA_CONTRAST,
      `${color.name} (${color.light}) → base-300 ${ramp['300']} = ${ratio.toFixed(2)}:1`,
    );
  }
});

test('20色すべてでダークモードの base-700 が暗背景に対して AA を満たす', () => {
  for (const color of PALETTE_20) {
    const ramp = deriveRamp(color.light, true);
    const ratio = contrastRatio(ramp['700'], DARK_BG);
    assert.ok(
      ratio >= AA_CONTRAST,
      `${color.name} (${color.light}) → base-700 ${ramp['700']} = ${ratio.toFixed(2)}:1`,
    );
  }
});

test('境界色（イエロー・グレイッシュホワイト）でも base-700 が AA を満たす', () => {
  for (const hex of ['#FFF1A8', '#E8E8E8']) {
    const ramp = deriveRamp(hex, false);
    assert.ok(contrastRatio(ramp['700'], WHITE) >= AA_CONTRAST, hex);
  }
});

test('ランプは 50 から 700 へ単調に暗くなる（ライト）', () => {
  for (const color of PALETTE_20) {
    const ramp = deriveRamp(color.light, false);
    const steps = ['50', '100', '200', '400', '500', '600', '700'] as const;
    let previous = 1;
    for (const step of steps) {
      const luminance = contrastRatio(ramp[step], '#000000');
      assert.ok(
        luminance <= previous || step === '50',
        `${color.name} の ${step} が前段より明るい`,
      );
      previous = luminance;
    }
  }
});

test('すべての段が正しい hex 形式を返す', () => {
  for (const color of PALETTE_20) {
    for (const isDark of [false, true]) {
      const ramp = deriveRamp(color.light, isDark);
      for (const value of Object.values(ramp)) {
        assert.match(value, /^#[0-9A-F]{6}$/);
      }
    }
  }
});

test('デフォルトカラーの面の色は現行のピンクをそのまま返す', () => {
  assert.equal(deriveSurfaces(DEFAULT_BASE_COLOR, false).chip, '#FFDCEE');
  assert.equal(deriveSurfaces(DEFAULT_BASE_COLOR, false)['grad-top'], '#FFE8F4');
  assert.equal(deriveSurfaces(DEFAULT_BASE_COLOR, false).surface, '#FEF4F9');
  assert.equal(deriveSurfaces(DEFAULT_BASE_COLOR, true).chip, '#3E2531');
  assert.equal(deriveSurfaces(DEFAULT_BASE_COLOR, true).surface, '#282022');
});

test('20色すべてで、補助テキストの読みやすさがデフォルトのピンク以上（AA を上限）', () => {
  const readOn = ['grad-top', 'grad-btm', 'surface', 'surface-secondary', 'card', 'card-done', 'elevated', 'chip'] as const;
  for (const color of PALETTE_20) {
    for (const [isDark, text] of [[false, TEXT_TERTIARY], [true, DARK_TEXT_TERTIARY]] as const) {
      const surfaces = deriveSurfaces(color.light, isDark);
      for (const key of readOn) {
        const ratio = contrastRatio(text, surfaces[key]);
        assert.ok(ratio >= surfaceTarget(key, isDark) - 0.001, `${color.name} ${isDark ? 'dark' : 'light'} ${key} ${surfaces[key]} = ${ratio.toFixed(2)}:1`);
      }
    }
  }
});

test('20色すべてで、見出しピルの文字（base-700）がピル（chip）に対して AA を満たす', () => {
  for (const color of PALETTE_20) {
    for (const isDark of [false, true]) {
      const ratio = contrastRatio(deriveRamp(color.light, isDark)['700'], deriveSurfaces(color.light, isDark).chip);
      assert.ok(ratio >= AA_CONTRAST, `${color.name} ${isDark ? 'dark' : 'light'} = ${ratio.toFixed(2)}:1`);
    }
  }
});

test('面の色は選んだテーマの色相を持つ（グレイッシュホワイトは無彩色）', () => {
  const yellow = hexToHsl(deriveSurfaces('#FFF1A8', false).chip);
  assert.ok(Math.abs(yellow.h - hexToHsl('#FFF1A8').h) < 3, `h=${yellow.h}`);
  const gray = hexToHsl(deriveSurfaces('#E8E8E8', false).chip);
  assert.ok(gray.s < 1, `s=${gray.s}`);
});

test('20色すべてで、チェックの枠（base-700）がリスト色のカード（20%）に対して 3:1 以上', () => {
  const mix = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const channel = (v: number) => Math.round(v * 0.2 + 255 * 0.8).toString(16).padStart(2, '0');
    return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
  };
  for (const theme of PALETTE_20) {
    const ring = deriveRamp(theme.light, false)['700'];
    for (const list of PALETTE_20) {
      const ratio = contrastRatio(ring, mix(list.light));
      assert.ok(ratio >= 3, `${theme.name} × ${list.name} = ${ratio.toFixed(2)}:1`);
    }
  }
});

test('デフォルトのピンクでは、補助テキストがすべての面に対して AA を満たす', () => {
  const surfaces = deriveSurfaces(DEFAULT_BASE_COLOR, false);
  for (const key of ['grad-top', 'grad-btm', 'surface', 'surface-secondary', 'card-done', 'chip'] as const) {
    const ratio = contrastRatio(TEXT_TERTIARY, surfaces[key]);
    assert.ok(ratio >= AA_CONTRAST, `${key} ${surfaces[key]} = ${ratio.toFixed(2)}:1`);
  }
});
