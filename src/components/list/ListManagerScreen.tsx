'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { LiveAnnouncer } from '@/components/feedback/LiveAnnouncer';
import { SkeletonTaskCard } from '@/components/feedback/SkeletonTaskCard';
import { AppShell } from '@/components/layout/AppShell';
import { ListFormSheet } from '@/components/list/ListFormSheet';
import { ListManagerRow } from '@/components/list/ListManagerRow';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useLists } from '@/hooks/useLists';
import { useListMutations, type ListFormValues } from '@/hooks/useListMutations';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useTasks } from '@/hooks/useTasks';
import { countTodoByList } from '@/lib/task/listView';
import { moveItem } from '@/lib/list/reorder';
import type { List } from '@/types/domain';

type Sheet = { mode: 'create' } | { mode: 'edit'; list: List };

export function ListManagerScreen() {
  const router = useRouter();
  const { lists, isLoading } = useLists();
  const { createList, updateList, deleteList, reorderLists } = useListMutations();
  const { confirm } = useConfirmDialog();
  const { showSnackbar } = useSnackbar();
  const { todoTasks } = useTasks({ listId: null, status: 'todo' });

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [pendingOrder, setPendingOrder] = useState<List[] | null>(null);
  const [announcement, setAnnouncement] = useState({ text: '', seq: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const rows = pendingOrder ?? lists;
  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);
  const counts = useMemo(() => countTodoByList(todoTasks, listIds), [todoTasks, listIds]);

  const announce = useCallback((text: string) => {
    setAnnouncement((current) => ({ text, seq: current.seq + 1 }));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const from = rows.findIndex((list) => list.id === active.id);
      const to = rows.findIndex((list) => list.id === over.id);
      if (from === -1 || to === -1) return;

      const next = moveItem(rows, from, to);
      setPendingOrder(next);
      announce(`${next[to].name}を${to + 1}番目に移動しました`);

      void reorderLists(next)
        .then(() => setPendingOrder(null))
        .catch(() => {
          setPendingOrder(null);
          showSnackbar({ message: '並び替えを保存できませんでした', variant: 'error' });
        });
    },
    [rows, reorderLists, showSnackbar, announce],
  );

  const handleDragStart = useCallback(() => {
    navigator.vibrate?.(10);
  }, []);

  const handleSubmit = useCallback(
    async (values: ListFormValues) => {
      try {
        if (sheet?.mode === 'edit') {
          await updateList(sheet.list, values);
          showSnackbar({ message: 'リストを更新しました' });
          return;
        }
        await createList(values);
        showSnackbar({ message: 'リストを追加しました' });
      } catch (cause) {
        showSnackbar({ message: '保存できませんでした。通信環境を確認してください', variant: 'error' });
        throw cause;
      }
    },
    [sheet, createList, updateList, showSnackbar],
  );

  const handleDelete = useCallback(
    async (list: List) => {
      const taskCount = counts[list.id] ?? 0;
      const accepted = await confirm({
        title: `「${list.name}」を削除しますか？`,
        message:
          taskCount > 0
            ? `リスト内のタスクは受信トレイに移動します（未完了${taskCount}件）`
            : 'リスト内のタスクは受信トレイに移動します',
        confirmLabel: '削除する',
        isDangerous: true,
      });
      if (!accepted) return;

      try {
        const moved = await deleteList(list);
        showSnackbar({
          message: moved > 0 ? `リストを削除し、${moved}件を受信トレイに移動しました` : 'リストを削除しました',
        });
      } catch {
        showSnackbar({ message: 'リストを削除できませんでした', variant: 'error' });
      }
    },
    [counts, confirm, deleteList, showSnackbar],
  );

  return (
    <AppShell
      header={{
        title: 'リストを管理',
        left: (
          <button
            type="button"
            aria-label="戻る"
            onClick={() => router.back()}
            className="-ml-2 flex size-tap-min shrink-0 items-center justify-center rounded-md text-base-700"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
        ),
        right: (
          <button
            type="button"
            onClick={() => setSheet({ mode: 'create' })}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-base-300 px-4 text-button text-on-base shadow-fab transition-colors duration-100 hover:bg-base-400 active:bg-base-500"
          >
            <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
            追加
          </button>
        ),
      }}
      activeTab="tasks"
      activeView="all"
      counts={counts}
      showFab={false}
      onCreateList={() => setSheet({ mode: 'create' })}
    >
      <LiveAnnouncer message={announcement.text} seq={announcement.seq} />

      <main className="mx-auto flex w-full max-w-content-max flex-col gap-3 px-4 pt-2 md:px-8">
        {isLoading ? (
          <SkeletonTaskCard count={4} />
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={listIds} strategy={verticalListSortingStrategy}>
                <ul className="flex list-none flex-col gap-2 p-0">
                  {rows.map((list) => (
                    <ListManagerRow
                      key={list.id}
                      list={list}
                      taskCount={counts[list.id] ?? 0}
                      onEdit={() => setSheet({ mode: 'edit', list })}
                      onDelete={() => void handleDelete(list)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>

            <p className="pt-1 text-center text-meta text-fg-tertiary">
              長押しでドラッグして並び替えできます
            </p>
          </>
        )}
      </main>

      {sheet && (
        <ListFormSheet
          mode={sheet.mode}
          list={sheet.mode === 'edit' ? sheet.list : undefined}
          onClose={() => setSheet(null)}
          onSubmit={handleSubmit}
        />
      )}
    </AppShell>
  );
}
