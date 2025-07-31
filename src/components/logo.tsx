import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link'; // Import the Link component

export function Logo({ className }: { className?: string }) {
  return (
    // Wrap the logo with a Link to make it navigable
    <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md">
      <div className={cn('flex items-center gap-2', className)}>
        <BrainCircuit className="h-8 w-8 text-primary" />
        <span className="text-xl font-headline font-bold text-primary">
          AIDocHub
        </span>
      </div>
    </Link>
  );
}
