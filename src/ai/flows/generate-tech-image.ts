'use server';

/**
 * @fileOverview A flow that finds an illustrative image URL for a technology from the web, with a fallback to AI image generation.
 *
 * - generateTechImage - A function that takes a technology name and returns an image URL.
 * - GenerateTechImageInput - The input type for the generateTechImage function.
 * - GenerateTechImageOutput - The return type for the generateTechImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleSearchRetriever} from '@genkit-ai/google-cloud';
import {googleAI} from '@genkit-ai/googleai';

const GenerateTechImageInputSchema = z.object({
  name: z.string().describe('The name of the technology.'),
});
export type GenerateTechImageInput = z.infer<typeof GenerateTechImageInputSchema>;

const GenerateTechImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'A URL for a relevant image (like a logo or illustrative image) for the technology.'
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
  input: {schema: GenerateTechImageInputSchema},
  output: {schema: GenerateTechImageOutputSchema},
  tools: [googleSearchRetriever],
  prompt: `You are an AI assistant. Your task is to find a relevant image URL for the given technology's logo.
Use the search tool. Only return the URL.

Technology: {{{name}}}
`,
});

const generateTechImageFlow = ai.defineFlow(
  {
    name: 'generateTechImageFlow',
    inputSchema: GenerateTechImageInputSchema,
    outputSchema: GenerateTechImageOutputSchema,
  },
  async input => {
    // 1. Try to find the image via web search
    try {
      const {output} = await generateTechImagePrompt(input);
      if (output?.imageUrl && output.imageUrl.startsWith('http')) {
        return output; // Success, return found URL
      }
    } catch (e) {
      console.error('Web search for image failed, falling back to generation.', e);
    }

    // 2. Fallback: Generate an image with AI
    try {
      const {media} = await ai.generate({
        model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
        prompt: `Create a minimalist and abstract logo for the technology: ${input.name}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media?.url) {
        return {imageUrl: media.url}; // Success, return generated image data URI
      }
    } catch (e) {
      console.error('Image generation failed.', e);
    }

    // 3. Final Fallback: Return an empty string, which the action handles
    return {imageUrl: ''};
  }
);