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
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';
import { LogIn } from 'lucide-react';

export default function Home() {
  const [technologies, setTechnologies] = React.useState<Technology[]>([]);
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [searchResults, setSearchResults] = React.useState<string[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);

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

  const handleDeleteTechnology = (id: number) => {
    setTechnologies(prev => prev.filter(tech => tech.id !== id));
  };

  const handleAddTechnology = async (techInfo: string) => {
    const result = await addTechnology(techInfo);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Adding Technology',
        description: result.error,
      });
    } else if (result.data) {
      setTechnologies(prev => [result.data!, ...prev]);
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
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 flex flex-col gap-4">
            {isAdmin && <AddTechnologyForm onAddTechnology={handleAddTechnology} />}
            <Separator />
            <KnowledgeBaseFilters
              categories={allCategories}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />
          </div>
        </SidebarContent>
        <SidebarFooter>
          {!isAdmin && (
            <div className="p-2">
              <Button variant="outline" className="w-full" onClick={() => setIsLoginDialogOpen(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            </div>
          )}
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
                onDelete={handleDeleteTechnology}
            />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
