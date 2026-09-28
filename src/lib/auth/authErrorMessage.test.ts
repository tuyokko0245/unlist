import test from 'node:test';
import assert from 'node:assert/strict';

import { authErrorMessage, getAuthErrorCode } from './authErrorMessage.ts';

const err = (code: string) => Object.assign(new Error(code), { code });

test('メール重複は登録済みを伝える', () => {
  assert.equal(
    authErrorMessage(err('auth/email-already-in-use'), 'signUp'),
    'このメールアドレスはすでに登録されています。ログインしてください',
  );
});

test('パスワード誤り・未登録はどちらか分からない文言にまとめる', () => {
  for (const code of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found']) {
    assert.equal(
      authErrorMessage(err(code), 'signIn'),
      'メールアドレスまたはパスワードが正しくありません',
      code,
    );
  }
});

test('ネットワーク断はどの操作でも通信の問題として伝える', () => {
  for (const action of ['signIn', 'signUp', 'google'] as const) {
    assert.match(authErrorMessage(err('auth/network-request-failed'), action) ?? '', /ネットワーク/);
  }
});

test('ポップアップを自分で閉じたときは何も出さない', () => {
  assert.equal(authErrorMessage(err('auth/popup-closed-by-user'), 'google'), null);
  assert.equal(authErrorMessage(err('auth/cancelled-popup-request'), 'google'), null);
});

test('未承認ドメイン（プレビューURL）はメールでのログインを案内する', () => {
  assert.match(authErrorMessage(err('auth/unauthorized-domain'), 'google') ?? '', /メールアドレスでログイン/);
});

test('未知のエラーは操作ごとの汎用文言', () => {
  assert.equal(authErrorMessage(new Error('x'), 'signIn'), 'ログインに失敗しました。もう一度お試しください');
  assert.equal(authErrorMessage(err('auth/internal-error'), 'signUp'), '新規登録に失敗しました。もう一度お試しください');
  assert.equal(authErrorMessage(null, 'google'), 'Googleログインに失敗しました。もう一度お試しください');
});

test('code を持たない値は null', () => {
  assert.equal(getAuthErrorCode('auth/x'), null);
  assert.equal(getAuthErrorCode({ code: 1 }), null);
  assert.equal(getAuthErrorCode(err('auth/x')), 'auth/x');
});
