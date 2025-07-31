'use server';

/**
 * @fileOverview A flow that summarizes technology information using Gemini.
 * It uses web search as a primary source of information.
 *
 * - summarizeTechInfo - A function that takes a technology name or description and returns a summary, categories, use cases, and relevant links in Brazilian Portuguese.
 * - SummarizeTechInfoInput - The input type for the summarizeTechInfo function.
 * - SummarizeTechInfoOutput - The return type for the summarizeTechInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Temporarily removing the problematic import. The package @genkit-ai/google-cloud
// in the installed version does not export this tool.
// import {googleSearchRetriever} from '@genkit-ai/google-cloud';

const SummarizeTechInfoInputSchema = z.object({
  techInfo: z
    .string()
    .describe('The name or description of the technology to summarize.'),
  existingCategories: z.array(z.string()).describe('A list of existing categories to choose from.'),
});
export type SummarizeTechInfoInput = z.infer<typeof SummarizeTechInfoInputSchema>;

const SummarizeTechInfoOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the technology.'),
  categories: z.array(z.string()).describe('Categories the technology belongs to. Should always contain at least one.'),
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
  // Temporarily disabling the tool to fix the build.
  // tools: [googleSearchRetriever],
  prompt: `Você é um especialista em IA. Sua tarefa é pesquisar na web sobre a tecnologia fornecida e, em seguida, gerar um resumo, identificar categorias, casos de uso comuns e links relevantes.
Responda em português do Brasil (pt-BR).

Tecnologia: {{{techInfo}}}

Use a lista de categorias existentes como referência. Prefira usar uma categoria existente se ela se encaixar. Se nenhuma for adequada, crie uma nova categoria concisa e apropriada. A tecnologia DEVE ter pelo menos uma categoria.
Categorias existentes: {{#each existingCategories}}- {{{this}}}\n{{/each}}

Utilize a ferramenta de busca para obter as informações mais recentes. Se a busca falhar ou não retornar resultados, use seu conhecimento interno.

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
    // Since the primary prompt with the tool will now always fail (as the tool is removed),
    // we can go directly to the fallback to use the model's internal knowledge.
    
    const fallbackPrompt = ai.definePrompt({
        name: 'summarizeTechInfoFallbackPrompt',
        input: {schema: SummarizeTechInfoInputSchema},
        output: {schema: SummarizeTechInfoOutputSchema},
        prompt: `Você é um especialista em IA. Com base em seu conhecimento, gere um resumo, identifique categorias, casos de uso comuns e links relevantes para a tecnologia fornecida.
Responda em português do Brasil (pt-BR).

Tecnologia: {{{techInfo}}}

Use a lista de categorias existentes como referência. Prefira usar uma categoria existente se ela se encaixar. Se nenhuma for adequada, crie uma nova categoria concisa e apropriada. A tecnologia DEVE ter pelo menos uma categoria.
Categorias existentes: {{#each existingCategories}}- {{{this}}}\n{{/each}}

Saída:
Resumo:
Categorias:
Casos de uso:
Links relevantes:`,
    });

    const {output} = await fallbackPrompt(input);
    return output!;
  }
);
