'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';

interface AddTechnologyFormProps {
  onAddTechnology: (techInfo: string) => Promise<void>;
}

export function AddTechnologyForm({ onAddTechnology }: AddTechnologyFormProps) {
  const [techInfo, setTechInfo] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow new lines with Shift+Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line on Enter
      handleSubmit(new Event('submit')); // Manually trigger form submission
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!techInfo.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onAddTechnology(techInfo);
      setTechInfo(''); // Clear input on successful submission
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="tech-info" className="text-sm font-medium text-foreground">
        Add a Technology
      </label>
      <Textarea
        id="tech-info"
        placeholder="e.g., 'Google Cloud Functions'"
        value={techInfo}
        onChange={(e) => setTechInfo(e.target.value)}
        onKeyDown={handleKeyDown} // Add key down handler
        rows={3}
        className="resize-none"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !techInfo.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Add with AI
          </>
        )}
      </Button>
    </form>
  );
}
