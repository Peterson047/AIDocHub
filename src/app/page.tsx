'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import type { Technology } from '@/lib/types';
import { addTechnology, searchTechnologies, getTechnologies } from '@/app/actions';

import { Logo } from '@/components/logo';
import { AddTechnologyForm } from '@/components/add-technology-form';
import { KnowledgeBaseFilters } from '@/components/knowledge-base-filters';
import { KnowledgeBaseView } from '@/components/knowledge-base-view';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [technologies, setTechnologies] = React.useState<Technology[]>([]);
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [searchResults, setSearchResults] = React.useState<string[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    const loadData = async () => {
      const { data, error } = await getTechnologies();
      if (error) {
        console.error("Failed to load technologies", error);
        toast({
            variant: 'destructive',
            title: 'Error Loading Data',
            description: 'Could not load technology data from the database.',
        });
      } else if (data) {
        setTechnologies(data);
      }
    };
    loadData();
  }, [toast]);

  const handleAddTechnology = async (techInfo: string) => {
    const result = await addTechnology(techInfo);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Adding Technology',
        description: result.error,
      });
    } else if (result.data) {
      // Refetch technologies to get the latest list
      const { data, error } = await getTechnologies();
       if (error) {
        console.error("Failed to reload technologies", error);
      } else if (data) {
        setTechnologies(data);
      }
      toast({
        title: 'Technology Added',
        description: `${result.data.name} has been added to your knowledge base.`,
      });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const result = await searchTechnologies(query);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: result.error,
      });
      setSearchResults([]);
    } else if (result.data) {
      setSearchResults(result.data.relevantTechnologies);
    }
    setIsSearching(false);
  };

  const allCategories = React.useMemo(() => {
    // Correctly get unique categories from the 'categories' array field
    const categories = new Set<string>();
    technologies.forEach(tech => {
        if(tech.categories) {
            tech.categories.forEach(cat => categories.add(cat));
        }
    });
    return Array.from(categories).sort();
  }, [technologies]);

  const filteredTechnologies = React.useMemo(() => {
    let result = technologies;

    // Correctly filter based on the 'categories' array field
    if (activeFilters.length > 0) {
      result = result.filter(tech =>
        activeFilters.every(filter => tech.categories.includes(filter))
      );
    }

    if (searchQuery && searchResults.length > 0) {
      const searchResultNames = new Set(searchResults.map(r => r.toLowerCase()));
      result = result.filter(tech => searchResultNames.has(tech.name.toLowerCase()));
    } else if (searchQuery && searchResults.length === 0 && !isSearching) {
       return [];
    }
    
    return result;
  }, [technologies, activeFilters, searchResults, searchQuery, isSearching]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 flex flex-col gap-4">
            <AddTechnologyForm onAddTechnology={handleAddTechnology} />
            <Separator />
            <KnowledgeBaseFilters
              categories={allCategories}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />
          </div>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 flex-1 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-2xl font-headline font-bold text-primary flex-grow">
                    Knowledge Base
                </h1>
            </div>
            <KnowledgeBaseView
                technologies={filteredTechnologies}
                onSearch={handleSearch}
                isLoading={isSearching}
                hasActiveSearch={!!searchQuery}
            />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
