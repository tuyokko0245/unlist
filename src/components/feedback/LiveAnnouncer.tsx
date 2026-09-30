'use client';

export function LiveAnnouncer({ message, seq }: { message: string; seq: number }) {
  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
      {seq % 2 === 1 ? '​' : ''}
    </p>
  );
}
