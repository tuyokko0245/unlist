'use client';

import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { InstallBanner } from '@/components/feedback/InstallBanner';
import { LiveAnnouncer } from '@/components/feedback/LiveAnnouncer';
import { AppShell } from '@/components/layout/AppShell';
import { CompletedSection } from '@/components/task/CompletedSection';
import { SwipeableRow } from '@/components/task/SwipeableRow';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskListView } from '@/components/task/TaskListView';
import { TaskSection } from '@/components/task/TaskSection';
import { useLists } from '@/hooks/useLists';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTodayTasks } from '@/hooks/useTodayTasks';
import { jstParts } from '@/lib/date/dueDate';
import { countTodo } from '@/lib/task/todayView';
import type { TaskStatus, TaskView } from '@/types/domain';

const MOVE_DELAY_MS = 800;

type SectionKey = 'overdue' | 'today' | 'starred';

export function TodayView() {
  const router = useRouter();
  const { lists } = useLists();
  const { groups, isLoading, error, retry, hasMoreCompleted, loadMoreCompleted } = useTodayTasks();
  const { toggleComplete, toggleStar, deleteTask } = useTaskMutations();

  const [justCompleted, setJustCompleted] = useState<Map<string, SectionKey>>(new Map());
  const [announcement, setAnnouncement] = useState({ text: '', seq: 0 });
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const holdInPlace = useCallback((taskId: string, section: SectionKey) => {
    setJustCompleted((current) => new Map(current).set(taskId, section));
    const timer = setTimeout(() => {
      setJustCompleted((current) => {
        const next = new Map(current);
        next.delete(taskId);
        return next;
      });
      timers.current.delete(taskId);
    }, MOVE_DELAY_MS);
    timers.current.set(taskId, timer);
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, TaskView>();
    for (const group of [groups.overdue, groups.today, groups.starred, groups.completed]) {
      for (const task of group) map.set(task.id, task);
    }
    return map;
  }, [groups]);

  const sectionOf = useCallback(
    (taskId: string): SectionKey => {
      if (groups.overdue.some((task) => task.id === taskId)) return 'overdue';
      if (groups.today.some((task) => task.id === taskId)) return 'today';
      return 'starred';
    },
    [groups],
  );

  const handleToggleComplete = useCallback(
    (taskId: string, next: TaskStatus) => {
      const task = byId.get(taskId);
      if (!task) return;
      if (next === 'completed') holdInPlace(taskId, sectionOf(taskId));
      setAnnouncement((current) => ({
        text: next === 'completed' ? 'タスクを完了しました' : '完了を取り消しました',
        seq: current.seq + 1,
      }));
      void toggleComplete(task);
    },
    [byId, holdInPlace, sectionOf, toggleComplete],
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

  const heldIn = useCallback(
    (section: SectionKey) => groups.completed.filter((task) => justCompleted.get(task.id) === section),
    [groups.completed, justCompleted],
  );

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
          onToggleComplete={handleToggleComplete}
          onToggleStar={handleToggleStar}
          onOpen={openTask}
        />
      </SwipeableRow>
    ),
    [handleDelete, handleToggleComplete, handleToggleStar, openTask],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { today: countTodo(groups) };
    for (const list of lists) result[list.id] = 0;
    for (const group of [groups.overdue, groups.today, groups.starred]) {
      for (const task of group) result[task.listId] = (result[task.listId] ?? 0) + 1;
    }
    return result;
  }, [groups, lists]);

  const { year, month, day } = jstParts(new Date());
  const todoCount = countTodo(groups);
  const isEmpty = !isLoading && !error && todoCount === 0 && groups.completed.length === 0;

  return (
    <AppShell
      header={{ title: '今日のタスク', subtitle: `${year}/${month}/${day}` }}
      activeTab="today"
      activeView="today"
      counts={counts}
      todayCount={todoCount}
      fabPulse={isEmpty}
    >
      <LiveAnnouncer message={announcement.text} seq={announcement.seq} />
      <main className="mx-auto flex w-full max-w-content-max flex-col gap-6 px-4 pt-1 md:px-8">
        <InstallBanner />
        <TaskListView
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={retry}
          emptyState={{
            icon: <CheckCheck size={40} aria-hidden="true" className="text-base-600" />,
            title: '今日のタスクはありません',
            description: '右下の＋からタスクを追加しましょう',
          }}
        >
          <>
            <TaskSection
              title="期限切れ"
              count={groups.overdue.length}
              tone="danger"
              hideWhenEmpty={heldIn('overdue').length === 0}
            >
              {[...groups.overdue, ...heldIn('overdue')].map((task) => renderCard(task))}
            </TaskSection>

            <TaskSection
              title="今日"
              count={groups.today.length}
              hideWhenEmpty={heldIn('today').length === 0}
            >
              {[...groups.today, ...heldIn('today')].map((task) => renderCard(task))}
            </TaskSection>

            <TaskSection
              title="スター"
              count={groups.starred.length}
              hideWhenEmpty={heldIn('starred').length === 0}
            >
              {[...groups.starred, ...heldIn('starred')].map((task) => renderCard(task))}
            </TaskSection>

            <CompletedSection
              count={groups.completed.length}
              hasMore={hasMoreCompleted}
              onLoadMore={loadMoreCompleted}
            >
              {groups.completed
                .filter((task) => !justCompleted.has(task.id))
                .map((task) => renderCard(task, 'completed'))}
            </CompletedSection>
          </>
        </TaskListView>
      </main>
    </AppShell>
  );
}
