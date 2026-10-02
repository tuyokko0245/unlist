import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSubtaskPrompt,
  isRetryableAiError,
  parseSubtaskSuggestions,
  SuggestionParseError,
} from './subtaskPrompt.ts';

test('プロンプトにタイトル・リスト・メモ・既存サブタスクが入る', () => {
  const prompt = buildSubtaskPrompt({
    title: ' 会議の準備 ',
    listName: '仕事',
    memo: '来週の定例',
    existing: ['資料を印刷する', ' '],
  });
  assert.equal(
    prompt,
    ['タスク: 会議の準備', 'リスト: 仕事', 'メモ: 来週の定例', '既にあるサブタスク:', '・資料を印刷する'].join('\n'),
  );
});

test('メモと既存サブタスクが無いときは（なし）', () => {
  const prompt = buildSubtaskPrompt({ title: '掃除', listName: '個人', memo: '  ', existing: [] });
  assert.match(prompt, /メモ: （なし）/);
  assert.match(prompt, /既にあるサブタスク:\n（なし）$/);
});

test('JSON の subtasks を取り出して前後の空白を除く', () => {
  assert.deepEqual(
    parseSubtaskSuggestions('{"subtasks":[" 議事録を開く ","アジェンダを作る","資料を印刷する"]}', []),
    ['議事録を開く', 'アジェンダを作る', '資料を印刷する'],
  );
});

test('先頭の番号や記号を取り除く', () => {
  assert.deepEqual(
    parseSubtaskSuggestions('{"subtasks":["1. 床を片付ける","・ゴミをまとめる","2) 掃除機をかける","- 窓を開ける","① 換気する"]}', []),
    ['床を片付ける', 'ゴミをまとめる', '掃除機をかける', '窓を開ける', '換気する'],
  );
});

test('既存サブタスクと重なるもの・提案同士の重複を除く', () => {
  assert.deepEqual(
    parseSubtaskSuggestions('{"subtasks":["資料を印刷する","会議室を予約する","会議室を予約する","参加者に連絡する"]}', ['資料を印刷する']),
    ['会議室を予約する', '参加者に連絡する'],
  );
});

test('7件を超えたら先頭7件・100文字を超えたら切り詰める', () => {
  const many = Array.from({ length: 9 }, (_, index) => `手順${index + 1}をする`);
  assert.equal(parseSubtaskSuggestions(JSON.stringify({ subtasks: many }), []).length, 7);
  const long = 'あ'.repeat(120);
  assert.equal(parseSubtaskSuggestions(JSON.stringify({ subtasks: [long] }), [])[0].length, 100);
});

test('文字列以外の要素は無視する', () => {
  assert.deepEqual(parseSubtaskSuggestions('{"subtasks":[1,null,"歯を磨く",""]}', []), ['歯を磨く']);
});

test('JSON でない・形が違う・有効な提案が0件はパースエラー', () => {
  assert.throws(() => parseSubtaskSuggestions('subtasks: 掃除', []), SuggestionParseError);
  assert.throws(() => parseSubtaskSuggestions('{"items":["a"]}', []), SuggestionParseError);
  assert.throws(() => parseSubtaskSuggestions('{"subtasks":[]}', []), SuggestionParseError);
  assert.throws(() => parseSubtaskSuggestions('{"subtasks":["掃除する"]}', ['掃除する']), SuggestionParseError);
});

test('フォールバックするエラー: 429 / 404 / 5xx / パースエラー', () => {
  const withStatus = (status: number) => Object.assign(new Error('x'), { customErrorData: { status } });
  assert.equal(isRetryableAiError(withStatus(429)), true);
  assert.equal(isRetryableAiError(withStatus(404)), true);
  assert.equal(isRetryableAiError(withStatus(500)), true);
  assert.equal(isRetryableAiError(withStatus(503)), true);
  assert.equal(isRetryableAiError(new SuggestionParseError('x')), true);
  assert.equal(isRetryableAiError(Object.assign(new Error('x'), { code: 'parse-failed' })), true);
  assert.equal(isRetryableAiError(new Error('[429 ] Resource exhausted (quota)')), true);
});

test('フォールバックしないエラー: 400 / 403 / 中断', () => {
  const withStatus = (status: number) => Object.assign(new Error('x'), { customErrorData: { status } });
  assert.equal(isRetryableAiError(withStatus(400)), false);
  assert.equal(isRetryableAiError(withStatus(403)), false);
  assert.equal(isRetryableAiError(new DOMException('aborted', 'AbortError')), false);
  assert.equal(isRetryableAiError(null), false);
});
