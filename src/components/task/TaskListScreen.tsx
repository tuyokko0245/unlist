'use client';

import { ListChecks, Menu } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LiveAnnouncer } from '@/components/feedback/LiveAnnouncer';
import { AppShell } from '@/components/layout/AppShell';
import { ListNav } from '@/components/layout/ListNav';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ListFormSheet } from '@/components/list/ListFormSheet';
import { Button } from '@/components/primitives/Button';
import { CompletedSection } from '@/components/task/CompletedSection';
import { FilterBar } from '@/components/task/FilterBar';
import { SwipeableRow } from '@/components/task/SwipeableRow';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskListView } from '@/components/task/TaskListView';
import { useLists } from '@/hooks/useLists';
import { useListMutations } from '@/hooks/useListMutations';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasks } from '@/hooks/useTasks';
import {
  countTodoByList,
  insertHeldTasks,
  selectCompletedTasks,
  selectTodoTasks,
  DEFAULT_STATUS_FILTER,
  type StatusFilter,
} from '@/lib/task/listView';
import type { TaskStatus, TaskView } from '@/types/domain';

const MOVE_DELAY_MS = 800;

interface HeldTask {
  task: TaskView;
  index: number;
}

export function TaskListScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedListId = searchParams.get('list');

  const { lists, listMap } = useLists();
  const { createList } = useListMutations();
  const { showSnackbar } = useSnackbar();
  const { toggleComplete, toggleStar, deleteTask } = useTaskMutations();

  const activeList = requestedListId ? (listMap.get(requestedListId) ?? null) : null;
  const listId = activeList?.id ?? null;

  const [status, setStatus] = useState<StatusFilter>(DEFAULT_STATUS_FILTER);
  const [starredOnly, setStarredOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [held, setHeld] = useState<HeldTask[]>([]);
  const [announcement, setAnnouncement] = useState({ text: '', seq: 0 });

  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const { todoTasks, completedTasks, isLoading, error, retry, hasMoreCompleted, loadMoreCompleted } =
    useTasks({ listId, status });

  const filter = useMemo(() => ({ listId, starredOnly }), [listId, starredOnly]);
  const visibleTodo = useMemo(() => selectTodoTasks(todoTasks, filter), [todoTasks, filter]);
  const visibleCompleted = useMemo(
    () => selectCompletedTasks(completedTasks, filter),
    [completedTasks, filter],
  );

  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);
  const counts = useMemo(() => countTodoByList(todoTasks, listIds), [todoTasks, listIds]);
  const todayBadge = useMemo(
    () => todoTasks.filter((task) => task.dueState === 'overdue' || task.dueState === 'today' || task.isStarred).length,
    [todoTasks],
  );

  const heldIds = useMemo(() => new Set(held.map((entry) => entry.task.id)), [held]);
  const todoRows = useMemo(() => insertHeldTasks(visibleTodo, held), [visibleTodo, held]);
  const completedRows = useMemo(
    () => visibleCompleted.filter((task) => !heldIds.has(task.id)),
    [visibleCompleted, heldIds],
  );

  const holdInPlace = useCallback((task: TaskView, index: number) => {
    setHeld((current) => [...current.filter((entry) => entry.task.id !== task.id), { task, index }]);
    const timer = setTimeout(() => {
      setHeld((current) => current.filter((entry) => entry.task.id !== task.id));
      timers.current.delete(task.id);
    }, MOVE_DELAY_MS);
    timers.current.set(task.id, timer);
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, TaskView>();
    for (const task of [...todoTasks, ...completedTasks]) map.set(task.id, task);
    for (const entry of held) map.set(entry.task.id, entry.task);
    return map;
  }, [todoTasks, completedTasks, held]);

  const handleToggleComplete = useCallback(
    (taskId: string, next: TaskStatus) => {
      const task = byId.get(taskId);
      if (!task) return;
      if (next === 'completed') {
        const index = visibleTodo.findIndex((row) => row.id === taskId);
        holdInPlace({ ...task, status: 'completed' }, index === -1 ? 0 : index);
      }
      setAnnouncement((current) => ({
        text: next === 'completed' ? 'タスクを完了しました' : '完了を取り消しました',
        seq: current.seq + 1,
      }));
      void toggleComplete(task);
    },
    [byId, holdInPlace, toggleComplete, visibleTodo],
  );

  const handleToggleStar = useCallback(
    (taskId: string) => {
      const task = byId.get(taskId);
      if (task) void toggleStar(task);
    },
    [byId, toggleStar],
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      const task = byId.get(taskId);
      if (task) void deleteTask(task);
    },
    [byId, deleteTask],
  );

  const openTask = useCallback((taskId: string) => router.push(`/tasks/${taskId}`), [router]);

  const renderCard = useCallback(
    (task: TaskView, variant: 'default' | 'completed' = 'default') => (
      <SwipeableRow
        key={task.id}
        onSwipeLeft={() => handleDelete(task.id)}
        onSwipeRight={() =>
          handleToggleComplete(task.id, task.status === 'completed' ? 'todo' : 'completed')
        }
      >
        <TaskCard
          task={task}
          variant={variant}
          showList={listId === null}
          onToggleComplete={handleToggleComplete}
          onToggleStar={handleToggleStar}
          onOpen={openTask}
        />
      </SwipeableRow>
    ),
    [handleDelete, handleToggleComplete, handleToggleStar, listId, openTask],
  );

  const navigate = useCallback(
    (href: string) => {
      setDrawerOpen(false);
      router.push(href);
    },
    [router],
  );

  const handleCreateList = useCallback(
    async (values: { name: string; color: string }) => {
      try {
        const createdId = await createList(values);
        showSnackbar({ message: 'リストを追加しました' });
        router.push(`/tasks?list=${createdId}`);
      } catch (cause) {
        showSnackbar({ message: 'リストを追加できませんでした', variant: 'error' });
        throw cause;
      }
    },
    [createList, router, showSnackbar],
  );

  const clearFilters = useCallback(() => {
    setStatus(DEFAULT_STATUS_FILTER);
    setStarredOnly(false);
    if (listId) router.push('/tasks');
  }, [listId, router]);

  const hasFilters = status !== DEFAULT_STATUS_FILTER || starredOnly || listId !== null;
  const totalCount =
    status === 'completed'
      ? completedRows.length
      : status === 'all'
        ? todoRows.length + completedRows.length
        : todoRows.length;
  const isEmpty = !isLoading && !error && todoRows.length === 0 && completedRows.length === 0;

  const emptyIcon = <ListChecks size={40} aria-hidden="true" className="text-base-600" />;

  return (
    <AppShell
      header={{
        title: activeList?.name ?? 'すべてのタスク',
        left: (
          <button
            type="button"
            aria-label="リストメニューを開く"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="-ml-2 flex size-tap-min shrink-0 items-center justify-center rounded-md text-base-700 md:hidden"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        ),
      }}
      activeTab="tasks"
      activeView={listId ? { listId } : 'all'}
      counts={counts}
      todayCount={todayBadge}
      fabHref={listId ? `/tasks/new?list=${listId}` : '/tasks/new'}
      onCreateList={() => setCreateSheetOpen(true)}
    >
      <LiveAnnouncer message={announcement.text} seq={announcement.seq} />

      <FilterBar
        status={status}
        starredOnly={starredOnly}
        onChangeStatus={setStatus}
        onToggleStarred={() => setStarredOnly((value) => !value)}
      />

      <main className="mx-auto flex w-full max-w-content-max flex-col gap-4 px-4 pt-2.5 md:px-8">
        {!isLoading && !error && !isEmpty && (
          <p className="text-meta text-fg-tertiary">全{totalCount}件</p>
        )}

        <TaskListView
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={retry}
          emptyState={
            hasFilters
              ? {
                  icon: emptyIcon,
                  title: '条件に合うタスクがありません',
                  description: 'フィルターを変えると見つかるかもしれません',
                  action: { label: 'フィルターをクリア', onClick: clearFilters },
                }
              : {
                  icon: emptyIcon,
                  title: 'タスクがありません',
                  description: '右下の＋からタスクを追加しましょう',
                }
          }
        >
          <>
            {status !== 'completed' && (
              <div className="flex flex-col gap-2">{todoRows.map((task) => renderCard(task))}</div>
            )}

            {status === 'all' && (
              <CompletedSection
                count={completedRows.length}
                hasMore={hasMoreCompleted}
                onLoadMore={loadMoreCompleted}
              >
                {completedRows.map((task) => renderCard(task, 'completed'))}
              </CompletedSection>
            )}

            {status === 'completed' && (
              <>
                <div className="flex flex-col gap-2">
                  {completedRows.map((task) => renderCard(task, 'completed'))}
                </div>
                {hasMoreCompleted && completedRows.length > 0 && (
                  <div className="flex justify-center pt-1">
                    <Button size="sm" variant="secondary" onClick={loadMoreCompleted}>
                      もっと見る
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        </TaskListView>
      </main>

      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ListNav
          lists={lists}
          counts={{ ...counts, today: todayBadge }}
          activeView={listId ? { listId } : 'all'}
          onSelectToday={() => navigate('/today')}
          onSelectAll={() => navigate('/tasks')}
          onSelectList={(selectedId) => navigate(`/tasks?list=${selectedId}`)}
          onCreateList={() => {
            setDrawerOpen(false);
            setCreateSheetOpen(true);
          }}
          onManageLists={() => navigate('/lists')}
        />
      </SideDrawer>

      {createSheetOpen && (
        <ListFormSheet
          mode="create"
          onClose={() => setCreateSheetOpen(false)}
          onSubmit={handleCreateList}
        />
      )}
    </AppShell>
  );
}
