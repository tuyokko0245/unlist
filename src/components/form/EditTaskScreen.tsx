'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { FullScreenSpinner } from '@/components/auth/AuthGuard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { TaskForm } from '@/components/form/TaskForm';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useLists } from '@/hooks/useLists';
import { useSaveTask, type TaskFormValues } from '@/hooks/useSaveTask';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useSubtasks } from '@/hooks/useSubtasks';
import { useTask } from '@/hooks/useTask';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toDrafts, type SubtaskDraft } from '@/lib/task/subtaskDiff';

const SAVED_FEEDBACK_MS = 500;

export function EditTaskScreen({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { lists } = useLists();
  const { task, isLoading, notFound } = useTask(taskId);
  const { subtasks, isLoading: subtasksLoading } = useSubtasks(taskId);
  const { updateTask } = useSaveTask();
  const { deleteTask } = useTaskMutations();
  const { showSnackbar } = useSnackbar();
  const { confirm } = useConfirmDialog();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (task) document.title = `${task.title} - ウンlist`;
  }, [task]);

  const initialValues = useMemo<TaskFormValues | null>(() => {
    if (!task) return null;
    return {
      title: task.title,
      listId: task.listId,
      priority: task.priority,
      isStarred: task.isStarred,
      dueDate: task.dueDate,
      reminder: task.reminder,
      repeat: task.repeat,
      memo: task.memo,
    };
  }, [task]);

  const initialSubtasks = useMemo(() => toDrafts(subtasks), [subtasks]);

  if (notFound) {
    return (
      <EmptyState
        title="タスクが見つかりません"
        description="削除されたか、URLが正しくない可能性があります"
        action={{ label: '今日のタスクへ戻る', onClick: () => router.replace('/today') }}
      />
    );
  }

  if (isLoading || subtasksLoading || !task || !initialValues) return <FullScreenSpinner />;

  const handleSubmit = async (values: TaskFormValues, drafts: SubtaskDraft[]) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      void updateTask(taskId, values, drafts, subtasks).catch(() => {});
      showSnackbar({ message: 'オフラインのため、接続後に保存されます', variant: 'info' });
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await updateTask(taskId, values, drafts, subtasks);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        showSnackbar({ message: '保存しました' });
        router.back();
      }, SAVED_FEEDBACK_MS);
    } catch {
      setIsSaving(false);
      showSnackbar({ message: '保存に失敗しました。接続を確認してください', variant: 'error' });
    }
  };

  const handleCancel = async (isDirty: boolean) => {
    if (!isDirty) {
      router.back();
      return;
    }
    const discard = await confirm({
      title: '編集内容を破棄しますか？',
      message: '変更した内容は保存されません',
      confirmLabel: '破棄する',
      isDangerous: true,
    });
    if (discard) router.back();
  };

  const handleDelete = async () => {
    await deleteTask(task);
    router.replace('/today');
  };

  return (
    <TaskForm
      key={task.id}
      mode="edit"
      lists={lists}
      initialValues={initialValues}
      initialSubtasks={initialSubtasks}
      meta={{ createdAt: task.createdAt, updatedAt: task.updatedAt }}
      isSaving={isSaving}
      isSaved={isSaved}
      onSubmit={(values, drafts) => void handleSubmit(values, drafts)}
      onCancel={(isDirty) => void handleCancel(isDirty)}
      onDelete={() => void handleDelete()}
    />
  );
}
