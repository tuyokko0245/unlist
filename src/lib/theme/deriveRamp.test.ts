import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AA_CONTRAST,
  DARK_BG,
  TEXT_PRIMARY,
  WHITE,
  contrastRatio,
  deriveRamp,
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
