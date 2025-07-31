'use server';

import { summarizeTechInfo } from '@/ai/flows/summarize-tech-info';
import { generateTechImage } from '@/ai/flows/generate-tech-image';
import { semanticSearchTech } from '@/ai/flows/semantic-search-tech';
import type { Technology } from '@/lib/types';
import { z } from 'zod';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';

// --- Database Setup ---
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.db');
let db: Awaited<ReturnType<typeof open>> | null = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
  }
  return db;
}

// Helper to parse JSON fields from the database
function parseJsonFields(tech: any): Technology {
    return {
        ...tech,
        categories: JSON.parse(tech.categories || '[]'),
        useCases: JSON.parse(tech.useCases || '[]'),
        relevantLinks: JSON.parse(tech.relevantLinks || '[]'),
    };
}


// --- Server Action: Get All Technologies ---
export async function getTechnologies(): Promise<{ data?: Technology[]; error?: string }> {
  try {
    const db = await getDb();
    const technologiesFromDb = await db.all(
      'SELECT id, name, summary, description, categories, useCases, relevantLinks, imageUrl FROM technologies ORDER BY id DESC'
    );
    const technologies = technologiesFromDb.map(parseJsonFields);
    return { data: technologies };
  } catch (e: any) {
    console.error('Error in getTechnologies:', e);
    return { error: 'Failed to read technologies from the database.' };
  }
}

// --- Server Action: Add a New Technology ---
const addTechSchema = z.string().min(3, 'Technology info must be at least 3 characters long.');

export async function addTechnology(techInfo: string): Promise<{ data?: Technology; error?: string }> {
  try {
    const validatedTechInfo = addTechSchema.parse(techInfo);
    const db = await getDb();

    const existingTechsFromDb = await db.all('SELECT categories FROM technologies');
    const existingCategories = Array.from(new Set(existingTechsFromDb.flatMap(t => JSON.parse(t.categories || '[]'))));

    const [summaryResult, imageResult] = await Promise.allSettled([
      summarizeTechInfo({ techInfo: validatedTechInfo, existingCategories }),
      generateTechImage({ name: validatedTechInfo }),
    ]);

    if (summaryResult.status === 'rejected') {
      const reason = summaryResult.reason instanceof Error ? summaryResult.reason.message : String(summaryResult.reason);
      throw new Error(`AI summarization failed: ${reason}`);
    }
    
    const summaryData = summaryResult.value;

    const imageUrl = imageResult.status === 'fulfilled' && imageResult.value.imageUrl
      ? imageResult.value.imageUrl
      : 'https://placehold.co/600x400.png';

    const newTechnologyData = {
        name: validatedTechInfo,
        summary: summaryData.summary,
        description: summaryData.summary,
        categories: JSON.stringify(summaryData.categories),
        useCases: JSON.stringify(summaryData.useCases),
        relevantLinks: JSON.stringify(summaryData.relevantLinks),
        imageUrl,
    };

    const result = await db.run(
      'INSERT INTO technologies (name, summary, description, categories, useCases, relevantLinks, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
      Object.values(newTechnologyData)
    );

    const newTechnology: Technology = {
      id: result.lastID as number,
      name: newTechnologyData.name,
      summary: newTechnologyData.summary,
      description: newTechnologyData.description,
      categories: JSON.parse(newTechnologyData.categories),
      useCases: JSON.parse(newTechnologyData.useCases),
      relevantLinks: JSON.parse(newTechnologyData.relevantLinks),
      imageUrl: newTechnologyData.imageUrl,
    };

    return { data: newTechnology };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(', ') };
    }
    console.error('Error in addTechnology:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

// --- Server Action: Search Technologies ---
const searchSchema = z.string().min(1);

export async function searchTechnologies(query: string): Promise<{ data?: { relevantTechnologies: string[] }; error?: string }> {
  try {
    const validatedQuery = searchSchema.parse(query);
    const db = await getDb();
    
    const allTech: Pick<Technology, 'name' | 'summary'>[] = await db.all('SELECT name, summary FROM technologies');

    if (allTech.length === 0) {
      return { data: { relevantTechnologies: [] } };
    }
    
    // Correctly and robustly create the knowledge base string with valid syntax
    const knowledgeBaseString = allTech
      .map(tech => `Technology: ${tech.name}\nDescription: ${tech.summary}`)
      .join('\n\n');

    const searchResult = await semanticSearchTech({
      query: validatedQuery,
      knowledgeBase: knowledgeBaseString,
    });

    return { data: searchResult };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(', ') };
    }
    console.error('Error in searchTechnologies:', e);
    return { error: 'An unexpected error occurred during search.' };
  }
}

// --- Server Action: Delete Technology ---
const deleteTechSchema = z.number().positive();

export async function deleteTechnology(id: number): Promise<{ success?: boolean; error?: string }> {
  try {
    const validatedId = deleteTechSchema.parse(id);
    const db = await getDb();
    const result = await db.run('DELETE FROM technologies WHERE id = ?', validatedId);

    if (result.changes === 0) {
      return { error: 'Technology not found.' };
    }

    return { success: true };
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(', ') };
    }
    console.error('Error in deleteTechnology action:', e);
    return { error: 'Failed to delete the technology.' };
  }
}
