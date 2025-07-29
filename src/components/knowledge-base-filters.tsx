'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface KnowledgeBaseFiltersProps {
  categories: string[];
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function KnowledgeBaseFilters({ categories, activeFilters, onFilterChange }: KnowledgeBaseFiltersProps) {
  const handleCheckedChange = (checked: boolean, category: string) => {
    onFilterChange(
      checked
        ? [...activeFilters, category]
        : activeFilters.filter(f => f !== category)
    );
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-headline font-semibold">Filter by Category</h3>
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={category}
              checked={activeFilters.includes(category)}
              onCheckedChange={checked => handleCheckedChange(Boolean(checked), category)}
            />
            <Label htmlFor={category} className="font-normal cursor-pointer">
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
