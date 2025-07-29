'use server';

/**
 * @fileOverview A flow that summarizes technology information using Gemini.
 *
 * - summarizeTechInfo - A function that takes a technology name or description and returns a summary, categories, use cases, and relevant links in Brazilian Portuguese.
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
  prompt: `Você é um especialista em IA. Resuma a tecnologia fornecida, identifique suas categorias, casos de uso comuns e links relevantes.
Responda em português do Brasil (pt-BR).

Informações da tecnologia: {{{techInfo}}}

Saída:
Resumo: 
Categorias:
Casos de uso:
Links relevantes:`,
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
