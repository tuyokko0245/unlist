import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canDeleteList,
  canRenameList,
  moveItem,
  nextListOrder,
  orderUpdates,
} from '@/lib/list/reorder';
import { chunk } from '@/lib/firebase/batch';

test('下へ動かすと間の要素が繰り上がる', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c', 'd'], 0, 2), ['b', 'c', 'a', 'd']);
});

test('上へ動かすと間の要素が繰り下がる', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c', 'd'], 3, 1), ['a', 'd', 'b', 'c']);
});

test('同じ位置や範囲外への移動では元の配列を返す', () => {
  const items = ['a', 'b'];
  assert.equal(moveItem(items, 1, 1), items);
  assert.equal(moveItem(items, -1, 0), items);
  assert.equal(moveItem(items, 0, 5), items);
});

test('order が並び順とずれている分だけ更新対象になる', () => {
  const ordered = [
    { id: 'a', order: 1 },
    { id: 'b', order: 0 },
    { id: 'c', order: 2 },
  ];
  assert.deepEqual(orderUpdates(ordered), [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
  ]);
});

test('並びが揃っていれば更新は発生しない', () => {
  const ordered = [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
  ];
  assert.deepEqual(orderUpdates(ordered), []);
});

test('order が飛んでいても詰め直される', () => {
  const ordered = [
    { id: 'a', order: 0 },
    { id: 'b', order: 7 },
  ];
  assert.deepEqual(orderUpdates(ordered), [{ id: 'b', order: 1 }]);
});

test('新しいリストの order は最大値の次になる', () => {
  assert.equal(nextListOrder([{ order: 0 }, { order: 3 }, { order: 1 }]), 4);
  assert.equal(nextListOrder([]), 0);
});

test('受信トレイは削除もリネームもできない', () => {
  assert.equal(canDeleteList({ isDefault: true }), false);
  assert.equal(canRenameList({ isDefault: true }), false);
  assert.equal(canDeleteList({ isDefault: false }), true);
  assert.equal(canRenameList({ isDefault: false }), true);
});

test('バッチは上限ごとに分割される', () => {
  const items = Array.from({ length: 1001 }, (_, index) => index);
  const chunks = chunk(items);
  assert.deepEqual(
    chunks.map((part) => part.length),
    [500, 500, 1],
  );
  assert.deepEqual(chunks.flat(), items);
});

test('空配列は分割されない', () => {
  assert.deepEqual(chunk([]), []);
});
