import { LumaSpin } from '@/components/ui/luma-spin';
import { cn } from '@/lib/utils';

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full items-center justify-center bg-background',
        className
      )}
    >
      <LumaSpin />
    </div>
  );
}
