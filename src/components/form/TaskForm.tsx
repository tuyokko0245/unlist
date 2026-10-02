'use client';

import { Bell, Calendar, Flag, List as ListIcon, Repeat, Star, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DetailRow } from '@/components/form/DetailRow';
import { SubtaskEditor } from '@/components/form/SubtaskEditor';
import { DueDateSheet } from '@/components/form/sheets/DueDateSheet';
import { ListSelectSheet } from '@/components/form/sheets/ListSelectSheet';
import { PrioritySheet } from '@/components/form/sheets/PrioritySheet';
import { ReminderSheet } from '@/components/form/sheets/ReminderSheet';
import { RepeatSheet } from '@/components/form/sheets/RepeatSheet';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Toggle } from '@/components/primitives/Toggle';
import type { TaskFormValues } from '@/hooks/useSaveTask';
import { formatDueDate, formatJstDate, formatReminderDateTime, jstParts } from '@/lib/date/dueDate';
import { formatRepeat } from '@/lib/repeat/nextDueDate';
import type { SubtaskDraft } from '@/lib/task/subtaskDiff';
import { PriorityBadge } from '@/components/task/TaskMeta';
import type { List } from '@/types/domain';
import { MAX_MEMO, MAX_TASK_TITLE } from '@/types/domain';

type SheetKey = 'list' | 'priority' | 'dueDate' | 'reminder' | 'repeat';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export interface TaskFormProps {
  mode: 'create' | 'edit';
  lists: List[];
  initialValues: TaskFormValues;
  initialSubtasks: SubtaskDraft[];
  meta?: { createdAt: Date; updatedAt: Date };
  isSaving: boolean;
  isSaved: boolean;
  onSubmit: (values: TaskFormValues, subtasks: SubtaskDraft[]) => void;
  onCancel: (isDirty: boolean) => void;
  onDelete?: () => void;
}

function serialize(values: TaskFormValues, subtasks: SubtaskDraft[]): string {
  return JSON.stringify([
    {
      ...values,
      dueDate: values.dueDate?.getTime() ?? null,
      reminder: values.reminder?.datetime.getTime() ?? null,
    },
    subtasks.map((subtask) => [subtask.title, subtask.isCompleted]),
  ]);
}

function formatMeta(date: Date): string {
  const { year, month, day } = jstParts(date);
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function TaskForm({
  mode,
  lists,
  initialValues,
  initialSubtasks,
  meta,
  isSaving,
  isSaved,
  onSubmit,
  onCancel,
  onDelete,
}: TaskFormProps) {
  const [values, setValues] = useState(initialValues);
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const baseline = useMemo(
    () => serialize(initialValues, initialSubtasks),
    [initialValues, initialSubtasks],
  );

  useEffect(() => {
    if (mode === 'create') titleRef.current?.focus();
  }, [mode]);

  const isDirty = serialize(values, subtasks) !== baseline;
  const canSave = values.title.trim().length > 0 && !isSaving;

  const selectedList = lists.find((list) => list.id === values.listId);

  const patch = useCallback((next: Partial<TaskFormValues>) => {
    setValues((current) => ({ ...current, ...next }));
  }, []);

  const submit = useCallback(() => {
    if (!canSave) return;
    onSubmit(values, subtasks);
  }, [canSave, onSubmit, values, subtasks]);

  const cancel = useCallback(() => onCancel(isDirty), [onCancel, isDirty]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        submit();
        return;
      }
      if (event.key === 'Escape' && openSheet === null) {
        event.preventDefault();
        cancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [submit, cancel, openSheet]);

  const dueValue = useMemo(() => {
    if (!values.dueDate) return 'なし';
    const parts = jstParts(values.dueDate);
    const thisYear = jstParts(new Date()).year;
    const base =
      parts.year === thisYear
        ? formatDueDate(values.dueDate)
        : formatJstDate(values.dueDate, true);
    return `${base}（${WEEKDAYS[parts.weekday]}）`;
  }, [values.dueDate]);

  return (
    <div className="flex min-h-dvh flex-col motion-safe:animate-[screen-slide-up_300ms_var(--ease-out-soft)]">
      <header className="app-header sticky top-0 z-30 flex h-header shrink-0 items-center justify-between gap-2 px-4 md:px-8">
        <button
          type="button"
          onClick={cancel}
          className="-ml-2.5 flex h-tap-min items-center gap-1.5 rounded-md px-2.5 text-body font-medium text-fg"
        >
          <X size={22} aria-hidden="true" />
          キャンセル
        </button>

        <div className="flex items-center gap-1">
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              aria-label="このタスクを削除"
              onClick={onDelete}
              className="flex size-tap-min items-center justify-center rounded-md text-danger"
            >
              <Trash2 size={22} aria-hidden="true" />
            </button>
          )}
          <Button size="sm" onClick={submit} disabled={!canSave} loading={isSaving} success={isSaved}>
            保存
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-content-max flex-col px-4 pb-10 md:px-8">
        <Input
          ref={titleRef}
          id="task-title"
          label="タスクのタイトル"
          visuallyHiddenLabel
          value={values.title}
          onChange={(title) => patch({ title })}
          maxLength={MAX_TASK_TITLE}
          placeholder="タスクのタイトル"
          emphasis
        />

        <h2 className="section-label mt-5 mb-2.5 w-fit">詳細設定</h2>

        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <DetailRow
            icon={<ListIcon size={20} aria-hidden="true" />}
            label="リスト"
            valueNode={
              selectedList ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: selectedList.color }}
                  />
                  {selectedList.name}
                </>
              ) : (
                'なし'
              )
            }
            isEmpty={!selectedList}
            onClick={() => setOpenSheet('list')}
          />
          <DetailRow
            icon={<Flag size={20} aria-hidden="true" />}
            label="優先度"
            valueNode={<PriorityBadge priority={values.priority} />}
            onClick={() => setOpenSheet('priority')}
          />
          <DetailRow
            icon={<Star size={20} aria-hidden="true" />}
            label="スター"
            control={
              <Toggle
                id="task-starred"
                checked={values.isStarred}
                label="スター"
                onChange={(isStarred) => patch({ isStarred })}
              />
            }
          />
          <DetailRow
            icon={<Calendar size={20} aria-hidden="true" />}
            label="期限日"
            value={dueValue}
            isEmpty={!values.dueDate}
            onClick={() => setOpenSheet('dueDate')}
          />
          <DetailRow
            icon={<Bell size={20} aria-hidden="true" />}
            label="リマインダー"
            value={values.reminder ? formatReminderDateTime(values.reminder.datetime) : 'なし'}
            isEmpty={!values.reminder}
            onClick={() => setOpenSheet('reminder')}
          />
          <DetailRow
            icon={<Repeat size={20} aria-hidden="true" />}
            label="繰り返し"
            value={formatRepeat(values.repeat)}
            isEmpty={!values.repeat}
            onClick={() => setOpenSheet('repeat')}
          />
        </div>

        <div className="mt-5 mb-2.5 flex items-center gap-2">
          <h2 className="section-label w-fit">サブタスク</h2>
          {subtasks.length > 0 && (
            <span className="text-meta font-medium text-fg-tertiary">
              {subtasks.filter((subtask) => subtask.isCompleted).length}/{subtasks.length}
            </span>
          )}
        </div>
        <SubtaskEditor subtasks={subtasks} onChange={setSubtasks} />

        <h2 className="section-label mt-5 mb-2.5 w-fit">メモ</h2>
        <Textarea
          id="task-memo"
          label="メモ"
          visuallyHiddenLabel
          value={values.memo}
          onChange={(memo) => patch({ memo })}
          maxLength={MAX_MEMO}
          placeholder="メモ（任意）"
        />

        {meta && (
          <div className="mt-5 flex flex-col gap-1 text-meta text-fg-tertiary">
            <span>作成: {formatMeta(meta.createdAt)}</span>
            <span>更新: {formatMeta(meta.updatedAt)}</span>
          </div>
        )}
      </div>

      <ListSelectSheet
        isOpen={openSheet === 'list'}
        lists={lists}
        selectedId={values.listId}
        onSelect={(listId) => patch({ listId })}
        onClose={() => setOpenSheet(null)}
      />
      <PrioritySheet
        isOpen={openSheet === 'priority'}
        selected={values.priority}
        onSelect={(priority) => patch({ priority })}
        onClose={() => setOpenSheet(null)}
      />
      <DueDateSheet
        isOpen={openSheet === 'dueDate'}
        value={values.dueDate}
        onSelect={(dueDate) => patch({ dueDate })}
        onClose={() => setOpenSheet(null)}
      />
      <ReminderSheet
        isOpen={openSheet === 'reminder'}
        value={values.reminder}
        dueDate={values.dueDate}
        onSelect={(reminder) => patch({ reminder })}
        onClose={() => setOpenSheet(null)}
      />
      <RepeatSheet
        isOpen={openSheet === 'repeat'}
        value={values.repeat}
        dueDate={values.dueDate}
        onSelect={(repeat) => patch({ repeat })}
        onClose={() => setOpenSheet(null)}
      />
    </div>
  );
}
