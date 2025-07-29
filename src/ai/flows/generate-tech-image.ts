'use server';

/**
 * @fileOverview A flow that finds an illustrative image URL for a technology from the web.
 *
 * - generateTechImage - A function that takes a technology name and returns an image URL.
 * - GenerateTechImageInput - The input type for the generateTechImage function.
 * - GenerateTechImageOutput - The return type for the generateTechImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleSearchRetriever } from '@genkit-ai/google-cloud';

const GenerateTechImageInputSchema = z.object({
  name: z.string().describe('The name of the technology.'),
});
export type GenerateTechImageInput = z.infer<typeof GenerateTechImageInputSchema>;

const GenerateTechImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'A URL for a relevant image (like a logo or illustrative image) for the technology, found on the web.'
    ),
});

export type GenerateTechImageOutput = z.infer<typeof GenerateTechImageOutputSchema>;

export async function generateTechImage(
  input: GenerateTechImageInput
): Promise<GenerateTechImageOutput> {
  return generateTechImageFlow(input);
}

const generateTechImagePrompt = ai.definePrompt({
    name: 'generateTechImagePrompt',
    input: { schema: GenerateTechImageInputSchema },
    output: { schema: GenerateTechImageOutputSchema },
    tools: [googleSearchRetriever],
    prompt: `You are an AI assistant. Your task is to find a relevant image URL for the given technology. 
    It could be a logo or an illustrative image. Use the search tool. Only return the URL.

    Technology: {{{name}}}
    `,
});

const generateTechImageFlow = ai.defineFlow(
  {
    name: 'generateTechImageFlow',
    inputSchema: GenerateTechImageInputSchema,
    outputSchema: GenerateTechImageOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await generateTechImagePrompt(input);
        if (output?.imageUrl) {
            // Basic check to see if the output is a likely URL
            if (output.imageUrl.startsWith('http')) {
                 return output;
            }
        }
    } catch (e) {
        console.error("Web search for image failed.", e);
    }
    
    // Fallback if the prompt fails or doesn't return a valid URL
    return { imageUrl: '' };
  }
);
