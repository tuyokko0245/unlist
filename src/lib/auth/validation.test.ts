import test from 'node:test';
import assert from 'node:assert/strict';

import { hasErrors, validateCredentials, validateEmail, validatePassword } from './validation.ts';

test('メールアドレス: 空は入力を促す', () => {
  assert.equal(validateEmail(''), 'メールアドレスを入力してください');
  assert.equal(validateEmail('   '), 'メールアドレスを入力してください');
});

test('メールアドレス: 形式が崩れていればエラー', () => {
  for (const value of ['foo', 'foo@', '@example.com', 'foo@example', 'fo o@example.com']) {
    assert.equal(validateEmail(value), 'メールアドレスの形式が正しくありません', value);
  }
});

test('メールアドレス: 前後の空白は許容する', () => {
  assert.equal(validateEmail('you@example.com'), undefined);
  assert.equal(validateEmail('  you@example.com  '), undefined);
});

test('パスワード: 6文字未満はエラー・6文字ちょうどは通す', () => {
  assert.equal(validatePassword(''), 'パスワードを入力してください');
  assert.equal(validatePassword('12345'), 'パスワードは6文字以上で入力してください');
  assert.equal(validatePassword('123456'), undefined);
});

test('両方まとめて検証する', () => {
  const errors = validateCredentials('foo', '123');
  assert.ok(errors.email);
  assert.ok(errors.password);
  assert.equal(hasErrors(errors), true);
  assert.equal(hasErrors(validateCredentials('you@example.com', 'secret')), false);
});
