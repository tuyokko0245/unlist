'use client';

import { Repeat } from 'lucide-react';
import type { CSSProperties } from 'react';

import { DueDateLabel, ListChip, PriorityBadge } from '@/components/task/TaskMeta';
import { StarButton } from '@/components/task/StarButton';
import { TaskCheckbox } from '@/components/task/TaskCheckbox';
import { formatDueDate } from '@/lib/date/dueDate';
import { taskAriaLabel } from '@/lib/task/todayView';
import type { TaskStatus, TaskView } from '@/types/domain';

export interface TaskCardProps {
  task: TaskView;
  variant?: 'default' | 'completed';
  showList?: boolean;
  onToggleComplete: (taskId: string, next: TaskStatus) => void;
  onToggleStar: (taskId: string, next: boolean) => void;
  onOpen: (taskId: string) => void;
}

export function TaskCard({
  task,
  variant = 'default',
  showList = true,
  onToggleComplete,
  onToggleStar,
  onOpen,
}: TaskCardProps) {
  const isDone = variant === 'completed' || task.status === 'completed';

  return (
    <article
      role="article"
      aria-label={taskAriaLabel(task, formatDueDate(task.dueDate))}
      className="task-card min-h-card-min-h cursor-pointer py-2.5 pr-3.5 pb-3 pl-[18px] transition-[opacity,transform] duration-100 active:scale-[0.98] active:opacity-90"
      style={{ '--list-color': task.list.color || undefined } as CSSProperties}
      data-done={isDone}
      onClick={() => onOpen(task.id)}
    >
      <div className="flex items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
        <TaskCheckbox
          checked={isDone}
          taskTitle={task.title}
          onChange={(next) => onToggleComplete(task.id, next ? 'completed' : 'todo')}
        />
        <h3
          className={`min-w-0 flex-1 truncate text-body-lg ${
            isDone ? 'text-fg-done line-through' : 'text-fg'
          }`}
        >
          {task.title}
        </h3>
        <StarButton
          isStarred={task.isStarred}
          taskTitle={task.title}
          onToggle={(next) => onToggleStar(task.id, next)}
        />
      </div>

      <div className="mt-0.5 ml-[34px] flex items-center gap-2 overflow-hidden">
        <PriorityBadge priority={task.priority} />
        {showList && <ListChip name={task.list.name} color={task.list.color} showDot={false} />}
        {task.repeat && (
          <Repeat size={15} aria-label="繰り返し" className="shrink-0 text-fg-tertiary" />
        )}
        {task.subtaskCount.total > 0 && (
          <span className="shrink-0 text-meta font-medium text-fg-tertiary">
            {task.subtaskCount.done}/{task.subtaskCount.total}
          </span>
        )}
        <span className="flex-1" />
        <DueDateLabel dueDate={task.dueDate} state={task.dueState} />
      </div>
    </article>
  );
}
