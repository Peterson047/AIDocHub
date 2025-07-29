'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  techInfo: z.string().min(3, {
    message: 'Please enter at least 3 characters.',
  }),
});

interface AddTechnologyFormProps {
  onAddTechnology: (techInfo: string) => Promise<void>;
}

export function AddTechnologyForm({ onAddTechnology }: AddTechnologyFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      techInfo: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await onAddTechnology(values.techInfo);
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="techInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-headline font-semibold">Add a Technology</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'LangChain', 'A tool for building RAG applications in Python...'"
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Summarize & Add
        </Button>
      </form>
    </Form>
  );
}
