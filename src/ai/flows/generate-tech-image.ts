'use server';

/**
 * @fileOverview A flow that generates an illustrative image for a technology.
 *
 * - generateTechImage - A function that takes a technology name and returns an image data URI.
 * - GenerateTechImageInput - The input type for the generateTechImage function.
 * - GenerateTechImageOutput - The return type for the generateTechImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTechImageInputSchema = z.object({
  name: z.string().describe('The name of the technology.'),
});
export type GenerateTechImageInput = z.infer<typeof GenerateTechImageInputSchema>;

const GenerateTechImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "A generated image for the technology, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateTechImageOutput = z.infer<typeof GenerateTechImageOutputSchema>;

export async function generateTechImage(
  input: GenerateTechImageInput
): Promise<GenerateTechImageOutput> {
  return generateTechImageFlow(input);
}

const generateTechImageFlow = ai.defineFlow(
  {
    name: 'generateTechImageFlow',
    inputSchema: GenerateTechImageInputSchema,
    outputSchema: GenerateTechImageOutputSchema,
  },
  async ({ name }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Crie uma imagem abstrata e minimalista para representar a tecnologia: ${name}. Use um estilo de arte digital moderno.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
