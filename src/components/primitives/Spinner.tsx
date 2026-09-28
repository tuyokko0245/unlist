import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 16 | 20 | 24 | 32;
  label?: string;
  className?: string;
}

export function Spinner({ size = 20, label = '読み込み中', className = '' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <Loader2
        size={size}
        aria-hidden="true"
        className="animate-spin motion-reduce:animate-none"
      />
    </span>
  );
}
