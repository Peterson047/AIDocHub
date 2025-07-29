'use server';

import { summarizeTechInfo } from '@/ai/flows/summarize-tech-info';
import { semanticSearchTech } from '@/ai/flows/semantic-search-tech';
import type { Technology } from '@/lib/types';
import { z } from 'zod';

const techInfoSchema = z.string().min(3, 'Technology info must be at least 3 characters long.');

export async function addTechnology(techInfo: string): Promise<{ data?: Technology; error?: string }> {
  try {
    const validatedTechInfo = techInfoSchema.parse(techInfo);

    const summaryData = await summarizeTechInfo({ techInfo: validatedTechInfo });

    const newTechnology: Technology = {
      id: crypto.randomUUID(),
      name: validatedTechInfo, // Initially set name to the input, user can edit later. AI doesn't return a definitive name.
      ...summaryData,
    };

    return { data: newTechnology };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(', ') };
    }
    console.error('Error in addTechnology action:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

const searchQuerySchema = z.string().min(1);

export async function searchTechnologies(
  query: string,
  knowledgeBase: Technology[]
): Promise<{ data?: { relevantTechnologies: string[] }; error?: string }> {
  try {
    const validatedQuery = searchQuerySchema.parse(query);

    const knowledgeBaseString = knowledgeBase
      .map(tech => `Technology: ${tech.name}\nDescription: ${tech.summary}`)
      .join('\n\n');
      
    if (!knowledgeBaseString.trim()) {
        return { data: { relevantTechnologies: [] } };
    }

    const searchResult = await semanticSearchTech({
      query: validatedQuery,
      knowledgeBase: knowledgeBaseString,
    });

    return { data: searchResult };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(', ') };
    }
    console.error('Error in searchTechnologies action:', e);
    return { error: e.message || 'An unexpected error occurred during search.' };
  }
}
