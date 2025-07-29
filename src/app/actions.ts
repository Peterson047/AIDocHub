'use server';

import { summarizeTechInfo } from '@/ai/flows/summarize-tech-info';
import { generateTechImage } from '@/ai/flows/generate-tech-image';
import { semanticSearchTech } from '@/ai/flows/semantic-search-tech';
import type { Technology } from '@/lib/types';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';

// Path to the data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'technologies.json');

/**
 * Reads technologies from the JSON file.
 */
async function readTechnologies(): Promise<Technology[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    throw error;
  }
}

/**
 * Writes technologies to the JSON file.
 */
async function writeTechnologies(technologies: Technology[]): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(technologies, null, 2), 'utf-8');
}

/**
 * Server action to get all technologies.
 */
export async function getTechnologies(): Promise<{ data?: Technology[]; error?: string }> {
    try {
        const technologies = await readTechnologies();
        // Return in reverse chronological order (newest first)
        return { data: technologies.reverse() };
    } catch (e: any) {
        console.error('Error in getTechnologies action:', e);
        return { error: 'Failed to read technologies from file.' };
    }
}


const techInfoSchema = z.string().min(3, 'Technology info must be at least 3 characters long.');

export async function addTechnology(techInfo: string): Promise<{ data?: Technology; error?: string }> {
  try {
    const validatedTechInfo = techInfoSchema.parse(techInfo);
    
    // Read current data to get existing categories
    const technologies = await readTechnologies();
    const existingCategories = Array.from(new Set(technologies.flatMap(t => t.categories)));

    // Run both AI flows in parallel
    const [summaryResult, imageResult] = await Promise.allSettled([
      summarizeTechInfo({ techInfo: validatedTechInfo, existingCategories }),
      generateTechImage({ name: validatedTechInfo }),
    ]);

    if (summaryResult.status === 'rejected') {
      console.error('Summarize tech info rejected:', summaryResult.reason);
      throw new Error('Failed to get technology summary.');
    }
    
    // Ensure we have data before proceeding
    if (!summaryResult.value) {
        console.error('Summarize tech info returned undefined value');
        throw new Error('Failed to get technology summary.');
    }

    const summaryData = summaryResult.value;

    const imageUrl =
      imageResult.status === 'fulfilled' && imageResult.value.imageUrl
        ? imageResult.value.imageUrl
        : 'https://placehold.co/600x400.png'; // Fallback image

    const newTechnology: Technology = {
      id: crypto.randomUUID(),
      name: validatedTechInfo,
      imageUrl,
      ...summaryData,
    };
    
    // Add new technology and write back
    technologies.push(newTechnology);
    await writeTechnologies(technologies);

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
