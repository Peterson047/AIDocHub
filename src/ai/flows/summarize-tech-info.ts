'use server';

/**
 * @fileOverview A flow that summarizes technology information using Gemini.
 *
 * - summarizeTechInfo - A function that takes a technology name or description and returns a summary, categories, use cases, and relevant links.
 * - SummarizeTechInfoInput - The input type for the summarizeTechInfo function.
 * - SummarizeTechInfoOutput - The return type for the summarizeTechInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTechInfoInputSchema = z.object({
  techInfo: z
    .string()
    .describe('The name or description of the technology to summarize.'),
});
export type SummarizeTechInfoInput = z.infer<typeof SummarizeTechInfoInputSchema>;

const SummarizeTechInfoOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the technology.'),
  categories: z.array(z.string()).describe('Categories the technology belongs to.'),
  useCases: z.array(z.string()).describe('Common use cases for the technology.'),
  relevantLinks: z.array(z.string()).describe('Useful links related to the technology.'),
});
export type SummarizeTechInfoOutput = z.infer<typeof SummarizeTechInfoOutputSchema>;

export async function summarizeTechInfo(input: SummarizeTechInfoInput): Promise<SummarizeTechInfoOutput> {
  return summarizeTechInfoFlow(input);
}

const summarizeTechInfoPrompt = ai.definePrompt({
  name: 'summarizeTechInfoPrompt',
  input: {schema: SummarizeTechInfoInputSchema},
  output: {schema: SummarizeTechInfoOutputSchema},
  prompt: `You are an AI expert. Summarize the given technology, identify its categories, common use cases, and relevant links.

Technology Information: {{{techInfo}}}

Output:
Summary: 
Categories:
Use Cases:
Relevant Links:`,
});

const summarizeTechInfoFlow = ai.defineFlow(
  {
    name: 'summarizeTechInfoFlow',
    inputSchema: SummarizeTechInfoInputSchema,
    outputSchema: SummarizeTechInfoOutputSchema,
  },
  async input => {
    const {output} = await summarizeTechInfoPrompt(input);
    return output!;
  }
);
