import { registerHooks } from 'node:module';

const srcUrl = new URL('../src/', import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(new URL(`${specifier.slice(2)}.ts`, srcUrl).href, context);
    }
    return nextResolve(specifier, context);
  },
});
