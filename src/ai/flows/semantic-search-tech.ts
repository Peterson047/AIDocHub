'use server';

/**
 * @fileOverview This file implements the semantic search for technologies.
 *
 * - semanticSearchTech - A function that takes a user query and returns relevant technologies.
 * - SemanticSearchTechInput - The input type for the semanticSearchTech function.
 * - SemanticSearchTechOutput - The return type for the semanticSearchTech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticSearchTechInputSchema = z.object({
  query: z.string().describe('The user query describing what they want to achieve.'),
  knowledgeBase: z.string().describe('The knowledge base of technologies and their descriptions.'),
});
export type SemanticSearchTechInput = z.infer<typeof SemanticSearchTechInputSchema>;

const SemanticSearchTechOutputSchema = z.object({
  relevantTechnologies: z.array(z.string()).describe('An array of relevant technologies from the knowledge base.'),
});
export type SemanticSearchTechOutput = z.infer<typeof SemanticSearchTechOutputSchema>;

export async function semanticSearchTech(input: SemanticSearchTechInput): Promise<SemanticSearchTechOutput> {
  return semanticSearchTechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticSearchTechPrompt',
  input: {schema: SemanticSearchTechInputSchema},
  output: {schema: SemanticSearchTechOutputSchema},
  prompt: `You are an AI assistant helping users find relevant technologies from a knowledge base.

The user will provide a query describing what they want to achieve. You should use the knowledge base to identify relevant technologies and return them as a list.

Knowledge Base:
{{knowledgeBase}}

User Query: {{{query}}}

Relevant Technologies:`, 
});

const semanticSearchTechFlow = ai.defineFlow(
  {
    name: 'semanticSearchTechFlow',
    inputSchema: SemanticSearchTechInputSchema,
    outputSchema: SemanticSearchTechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
