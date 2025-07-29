'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TechnologyCard } from '@/components/technology-card';
import type { Technology } from '@/lib/types';
import { Loader2, Search, FileQuestion } from 'lucide-react';

interface KnowledgeBaseViewProps {
  technologies: Technology[];
  onSearch: (query: string) => void;
  isLoading: boolean;
  hasActiveSearch: boolean;
}

export function KnowledgeBaseView({ technologies, onSearch, isLoading, hasActiveSearch }: KnowledgeBaseViewProps) {
  const [query, setQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Searching with AI...</p>
          <p>Analyzing your knowledge base.</p>
        </div>
      );
    }

    if (technologies.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {technologies.map(tech => (
            <TechnologyCard key={tech.id} technology={tech} />
          ))}
        </div>
      );
    }
    
    if (hasActiveSearch) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <FileQuestion className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-medium">No Matching Technologies</p>
                <p>Your search did not match any technologies in the knowledge base.</p>
            </div>
        );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <FileQuestion className="h-12 w-12 text-primary mb-4" />
        <p className="text-lg font-medium">Your Knowledge Base is Empty</p>
        <p>Use the form on the left to add your first technology.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSearchSubmit} className="flex w-full items-center space-x-2 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Describe what you want to do (e.g., 'connect to a vector database in Python')"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {renderContent()}
      </div>
    </div>
  );
}
