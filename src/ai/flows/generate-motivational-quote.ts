// src/ai/flows/generate-motivational-quote.ts
'use server';

/**
 * @fileOverview Generates motivational quotes based on a selected category.
 *
 * - generateMotivationalQuote - A function that generates a motivational quote.
 * - GenerateMotivationalQuoteInput - The input type for the generateMotivationalQuote function.
 * - GenerateMotivationalQuoteOutput - The return type for the generateMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationalQuoteInputSchema = z.object({
  category: z
    .enum([
      'success',
      'study',
      'self-improvement',
      'discipline',
    ])
    .describe('The category of motivational quote to generate.'),
});

export type GenerateMotivationalQuoteInput = z.infer<
  typeof GenerateMotivationalQuoteInputSchema
>;

const GenerateMotivationalQuoteOutputSchema = z.object({
  quote: z.string().describe('The generated motivational quote.'),
});

export type GenerateMotivationalQuoteOutput = z.infer<
  typeof GenerateMotivationalQuoteOutputSchema
>;

export async function generateMotivationalQuote(
  input: GenerateMotivationalQuoteInput
): Promise<GenerateMotivationalQuoteOutput> {
  return generateMotivationalQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalQuotePrompt',
  input: {schema: GenerateMotivationalQuoteInputSchema},
  output: {schema: GenerateMotivationalQuoteOutputSchema},
  prompt: `You are a motivational quote generator. Generate a quote based on the following category: {{{category}}}.`,
});

const generateMotivationalQuoteFlow = ai.defineFlow(
  {
    name: 'generateMotivationalQuoteFlow',
    inputSchema: GenerateMotivationalQuoteInputSchema,
    outputSchema: GenerateMotivationalQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
