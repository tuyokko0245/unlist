import { MAX_SUBTASK_TITLE } from '@/types/domain';

export const MIN_SUGGESTIONS = 3;
export const MAX_SUGGESTIONS = 7;

export const SUBTASK_SYSTEM_INSTRUCTION = `あなたはADHDの人のためのTodoアプリのアシスタントです。
ユーザーのタスクを、すぐに着手できる小さなサブタスクに分解してください。

- サブタスクは${MIN_SUGGESTIONS}〜${MAX_SUGGESTIONS}件。タスクの大きさに合わせて件数を決め、水増しはしない
- 実行する順番に並べる
- 1件は1つの具体的な行動にする。目安は5〜15分で終わる大きさ
- 1件目は、気が重くても始められる一番小さな行動にする（例:「資料のファイルを開く」）
- 「〜する」「〜を買う」のように動詞で終わる、30文字以内の日本語にする
- 番号・記号・絵文字・補足説明は付けない
- 「頑張る」「準備する」「確認する」だけの曖昧な項目にせず、何をするのかまで書く
- 既にあるサブタスクと同じ内容は出さない
- メモに事情が書かれていれば考慮する。意図が分からないときは一般的な解釈で分解する`;

export interface SubtaskPromptInput {
  title: string;
  listName: string;
  memo: string;
  existing: string[];
}

export function buildSubtaskPrompt({ title, listName, memo, existing }: SubtaskPromptInput): string {
  const existingLines = existing.map((item) => item.trim()).filter(Boolean);
  return [
    `タスク: ${title.trim()}`,
    `リスト: ${listName.trim() || '（なし）'}`,
    `メモ: ${memo.trim() || '（なし）'}`,
    '既にあるサブタスク:',
    existingLines.length ? existingLines.map((item) => `・${item}`).join('\n') : '（なし）',
  ].join('\n');
}

export class SuggestionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SuggestionParseError';
  }
}

const LEADING_MARKER = /^(?:[-*・•●○◯□■✓✔︎]+|\(?\d+[.)．、]|[①-⑳])\s*/u;

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parseSubtaskSuggestions(raw: string, existing: string[]): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SuggestionParseError('JSON として読めない');
  }

  const list =
    parsed && typeof parsed === 'object' && 'subtasks' in parsed
      ? (parsed as { subtasks: unknown }).subtasks
      : null;
  if (!Array.isArray(list)) throw new SuggestionParseError('subtasks が配列でない');

  const seen = new Set(existing.map(normalize).filter(Boolean));
  const result: string[] = [];
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const title = normalize(item.replace(LEADING_MARKER, '')).slice(0, MAX_SUBTASK_TITLE).trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    result.push(title);
    if (result.length === MAX_SUGGESTIONS) break;
  }

  if (result.length === 0) throw new SuggestionParseError('有効な提案が0件');
  return result;
}

export function isRetryableAiError(error: unknown): boolean {
  if (error instanceof SuggestionParseError) return true;
  if (!error || typeof error !== 'object') return false;

  const status = (error as { customErrorData?: { status?: number } }).customErrorData?.status;
  if (typeof status === 'number') return status === 404 || status === 429 || status >= 500;

  const code = (error as { code?: unknown }).code;
  if (code === 'parse-failed') return true;

  const message = error instanceof Error ? error.message : '';
  return /\b(404|429|5\d\d)\b|quota|rate.?limit|not.?found|internal|unavailable/i.test(message);
}
