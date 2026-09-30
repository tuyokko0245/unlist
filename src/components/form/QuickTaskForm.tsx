'use client';

import { addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';
import { useSnackbar } from '@/hooks/useSnackbar';
import { fromDueDateInputValue, jstParts } from '@/lib/date/dueDate';
import { db } from '@/lib/firebase/config';
import { tasksCollection } from '@/lib/firebase/refs';
import { MAX_TASK_TITLE, type Priority } from '@/types/domain';

function todayInputValue(): string {
  const { year, month, day } = jstParts(new Date());
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function QuickTaskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { lists, defaultList } = useLists();
  const { showSnackbar } = useSnackbar();

  const [title, setTitle] = useState('');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState(todayInputValue());
  const [priority, setPriority] = useState<Priority>('medium');
  const [isStarred, setIsStarred] = useState(false);
  const [saving, setSaving] = useState(false);

  const targetListId = listId || defaultList?.id || '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !title.trim() || !targetListId || saving) return;

    setSaving(true);
    const due = fromDueDateInputValue(dueDate);
    try {
      await addDoc(tasksCollection(db, user.uid), {
        title: title.trim(),
        listId: targetListId,
        status: 'todo',
        priority,
        isStarred,
        dueDate: due ? Timestamp.fromDate(due) : null,
        reminder: null,
        repeat: null,
        memo: '',
        completedAt: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      showSnackbar({ message: 'タスクを追加しました' });
      router.push('/today');
    } catch {
      showSnackbar({ message: '保存できませんでした。通信環境を確認してください', variant: 'error' });
      setSaving(false);
    }
  };

  return (
    <AppShell header={{ title: 'タスクを追加' }} showFab={false}>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-content-max flex-col gap-4 px-4 pt-2 md:px-8"
      >
        <Input
          id="task-title"
          label="タイトル"
          value={title}
          onChange={setTitle}
          maxLength={MAX_TASK_TITLE}
          autoFocus
          placeholder="やることを入力"
        />

        <label className="flex flex-col gap-2 text-meta text-fg-secondary">
          リスト
          <select
            value={targetListId}
            onChange={(event) => setListId(event.target.value)}
            className="h-13 rounded-md border border-border bg-input px-3.5 text-body text-fg"
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-meta text-fg-secondary">
          期限日
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-13 rounded-md border border-border bg-input px-3.5 text-body text-fg"
          />
        </label>

        <label className="flex flex-col gap-2 text-meta text-fg-secondary">
          優先度
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="h-13 rounded-md border border-border bg-input px-3.5 text-body text-fg"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>

        <label className="flex min-h-tap-min items-center gap-3 text-body text-fg">
          <input
            type="checkbox"
            checked={isStarred}
            onChange={(event) => setIsStarred(event.target.checked)}
            className="size-5 accent-[var(--color-base-600)]"
          />
          スターを付ける
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" size="lg" fullWidth loading={saving} disabled={!title.trim()}>
            保存
          </Button>
          <Button size="lg" variant="secondary" onClick={() => router.push('/today')}>
            キャンセル
          </Button>
        </div>

        <p className="text-meta text-fg-tertiary">
          この画面は仮実装です。Tier 1 #3 でシート形式の本実装に差し替えます。
        </p>
      </form>
    </AppShell>
  );
}
