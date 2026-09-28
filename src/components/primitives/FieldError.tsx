import { TriangleAlert } from 'lucide-react';

export function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex flex-1 items-start gap-1.5 pl-1 text-meta text-danger">
      <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
