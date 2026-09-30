'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { FullScreenSpinner } from '@/components/auth/AuthGuard';
import { TaskForm } from '@/components/form/TaskForm';
import type { TaskFormValues } from '@/hooks/useSaveTask';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useLists } from '@/hooks/useLists';
import { useSaveTask } from '@/hooks/useSaveTask';
import { useSnackbar } from '@/hooks/useSnackbar';
import type { SubtaskDraft } from '@/lib/task/subtaskDiff';

const SAVED_FEEDBACK_MS = 500;

export function NewTaskScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lists, defaultList, isLoading } = useLists();
  const { createTask } = useSaveTask();
  const { showSnackbar } = useSnackbar();
  const { confirm } = useConfirmDialog();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (isLoading || !defaultList) return <FullScreenSpinner />;

  const requestedListId = searchParams.get('list');
  const initialListId =
    lists.find((list) => list.id === requestedListId)?.id ?? defaultList.id;

  const initialValues: TaskFormValues = {
    title: '',
    listId: initialListId,
    priority: 'medium',
    isStarred: false,
    dueDate: null,
    reminder: null,
    repeat: null,
    memo: '',
  };

  const handleSubmit = async (values: TaskFormValues, subtasks: SubtaskDraft[]) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      void createTask(values, subtasks).catch(() => {});
      showSnackbar({ message: 'オフラインのため、接続後に保存されます', variant: 'info' });
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await createTask(values, subtasks);
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        showSnackbar({ message: 'タスクを追加しました' });
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
      message: '入力した内容は保存されません',
      confirmLabel: '破棄する',
      isDangerous: true,
    });
    if (discard) router.back();
  };

  return (
    <TaskForm
      mode="create"
      lists={lists}
      initialValues={initialValues}
      initialSubtasks={[]}
      isSaving={isSaving}
      isSaved={isSaved}
      onSubmit={(values, subtasks) => void handleSubmit(values, subtasks)}
      onCancel={(isDirty) => void handleCancel(isDirty)}
    />
  );
}
