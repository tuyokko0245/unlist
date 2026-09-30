import { EditTaskScreen } from '@/components/form/EditTaskScreen';

export default async function TaskDetailPage({ params }: PageProps<'/tasks/[taskId]'>) {
  const { taskId } = await params;
  return <EditTaskScreen taskId={taskId} />;
}
