export interface PaletteColor {
  name: string;
  light: string;
  dark: string;
}

export const PALETTE_20: readonly PaletteColor[] = [
  { name: 'ミントグリーン', light: '#A8E6CF', dark: '#3A6B54' },
  { name: 'ライトブルー', light: '#AED9E0', dark: '#385F66' },
  { name: 'スカイブルー', light: '#B5D5E8', dark: '#3A5A6B' },
  { name: 'ラベンダー', light: '#C8B8DB', dark: '#4A3D66' },
  { name: 'ライラック', light: '#D4B8E0', dark: '#523B66' },
  { name: 'ピーチ', light: '#F9C5A7', dark: '#6B4A34' },
  { name: 'サーモンピンク', light: '#FABEBE', dark: '#6B3A3A' },
  { name: 'ベビーピンク', light: '#FFCCD5', dark: '#6B3A44' },
  { name: 'ピンク', light: '#FBB6D8', dark: '#6B3450' },
  { name: 'イエロー', light: '#FFF1A8', dark: '#6B6330' },
  { name: 'バナナ', light: '#FAEDB0', dark: '#65613A' },
  { name: 'ライトオレンジ', light: '#FDDCB5', dark: '#6B5234' },
  { name: 'コーラル', light: '#FFBDA8', dark: '#6B4234' },
  { name: 'セージグリーン', light: '#B8D8B8', dark: '#3A5A3A' },
  { name: 'ライムグリーン', light: '#C5E8A8', dark: '#3F6630' },
  { name: 'スプリンググリーン', light: '#B8E8C8', dark: '#3A6648' },
  { name: 'アクアマリン', light: '#A8DDD8', dark: '#355B58' },
  { name: 'パウダーブルー', light: '#B8CCE8', dark: '#3A4F6B' },
  { name: 'モーブ', light: '#D8B8D8', dark: '#573557' },
  { name: 'グレイッシュホワイト', light: '#E8E8E8', dark: '#505050' },
] as const;

export const DEFAULT_BASE_COLOR = '#FBB6D8';

export const DEFAULT_BASE_COLOR_INDEX = 8;

export const PALETTE_LIGHT: readonly string[] = PALETTE_20.map((c) => c.light);

export function findPaletteIndex(hex: string): number {
  const target = hex.toUpperCase();
  return PALETTE_20.findIndex((c) => c.light.toUpperCase() === target);
}

export function paletteColorAt(index: number): PaletteColor {
  const length = PALETTE_20.length;
  return PALETTE_20[((index % length) + length) % length];
}

export function confettiColors(baseColor: string, ramp: Record<string, string>): string[] {
  const index = findPaletteIndex(baseColor);
  const start = index === -1 ? DEFAULT_BASE_COLOR_INDEX : index;
  return [
    ramp['300'],
    ramp['400'],
    ramp['600'],
    paletteColorAt(start + 5).light,
    paletteColorAt(start + 10).light,
  ];
}

export const PRESET_LISTS: readonly { name: string; color: string; isDefault: boolean }[] = [
  { name: '受信トレイ', color: '#FFBDA8', isDefault: true },
  { name: '仕事', color: '#B5D5E8', isDefault: false },
  { name: '個人', color: '#C8B8DB', isDefault: false },
  { name: '買い物', color: '#B8D8B8', isDefault: false },
] as const;
