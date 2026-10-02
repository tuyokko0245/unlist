import test from 'node:test';
import assert from 'node:assert/strict';

import { needsReauthentication, reauthMethodOf } from './recentLogin.ts';

const NOW = Date.parse('2026-10-03T10:00:00Z');

test('最後のログインから4分以内なら再認証は不要', () => {
  assert.equal(needsReauthentication(new Date(NOW - 3 * 60 * 1000).toUTCString(), NOW), false);
  assert.equal(needsReauthentication(new Date(NOW - 4 * 60 * 1000).toUTCString(), NOW), false);
});

test('4分を超えていたら再認証が必要', () => {
  assert.equal(needsReauthentication(new Date(NOW - 4 * 60 * 1000 - 1000).toUTCString(), NOW), true);
  assert.equal(needsReauthentication(new Date(NOW - 24 * 60 * 60 * 1000).toUTCString(), NOW), true);
});

test('ログイン時刻が分からないときは再認証が必要', () => {
  assert.equal(needsReauthentication(undefined, NOW), true);
  assert.equal(needsReauthentication('不明', NOW), true);
});

test('再認証の方法はプロバイダから決める（Google を優先）', () => {
  assert.equal(reauthMethodOf(['google.com']), 'google');
  assert.equal(reauthMethodOf(['password']), 'password');
  assert.equal(reauthMethodOf(['password', 'google.com']), 'google');
  assert.equal(reauthMethodOf([]), null);
});
