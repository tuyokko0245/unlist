export const BATCH_LIMIT = 500;

export function chunk<T>(items: T[], size: number = BATCH_LIMIT): T[][] {
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
