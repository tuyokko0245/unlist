import { deriveRamp, deriveSurfaces, normalizeHex, type Ramp, type Surfaces } from './deriveRamp';

export const THEME_STORAGE_KEY = 'unlist.theme';

export type ThemeTokens = Ramp & Surfaces;

export interface CachedTheme {
  baseColor: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

export function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function applyRamp(tokens: ThemeTokens, root: HTMLElement): void {
  for (const [step, value] of Object.entries(tokens)) {
    root.style.setProperty(`--app-base-${step}`, value);
  }
}

export function applyThemeColorMeta(theme: CachedTheme): void {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const tokens = meta.media.includes('dark') ? theme.dark : theme.light;
    if (meta.content !== tokens['grad-top']) meta.content = tokens['grad-top'];
  }
}

export function keepThemeColorMeta(theme: CachedTheme): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(() => applyThemeColorMeta(theme));
  observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
  return () => observer.disconnect();
}

export function buildTheme(baseColor: string): CachedTheme {
  const hex = normalizeHex(baseColor);
  return {
    baseColor: hex,
    light: { ...deriveRamp(hex, false), ...deriveSurfaces(hex, false) },
    dark: { ...deriveRamp(hex, true), ...deriveSurfaces(hex, true) },
  };
}

export function applyBaseColor(baseColor: string): CachedTheme {
  const theme = buildTheme(baseColor);
  if (typeof document === 'undefined') return theme;

  applyRamp(prefersDark() ? theme.dark : theme.light, document.documentElement);
  applyThemeColorMeta(theme);

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // localStorage が使えない環境では FOUC 対策のキャッシュのみ諦める
  }

  return theme;
}

export function readCachedTheme(): CachedTheme | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CachedTheme) : null;
  } catch {
    return null;
  }
}

export function watchColorScheme(theme: CachedTheme): () => void {
  if (typeof window === 'undefined') return () => {};

  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (event: MediaQueryListEvent) => {
    applyRamp(event.matches ? theme.dark : theme.light, document.documentElement);
  };

  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}

export const THEME_INIT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem('${THEME_STORAGE_KEY}'));if(!t)return;var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=d?t.dark:t.light;for(var k in r){document.documentElement.style.setProperty('--app-base-'+k,r[k]);}var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++){var s=m[i].media.indexOf('dark')>=0?t.dark:t.light;if(s['grad-top'])m[i].content=s['grad-top'];}}catch(e){}})();`;
