// src/ai/flows/ai-habit-analyzer.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing user habit data and providing personalized suggestions.
 *
 * - analyzeHabits - Analyzes habit data and provides suggestions for improvement.
 * - AnalyzeHabitsInput - The input type for the analyzeHabits function.
 * - AnalyzeHabitsOutput - The return type for the analyzeHabits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHabitsInputSchema = z.object({
  habitData: z
    .string()
    .describe(
      'A string containing the user habit data, including habit names, completion status, and any relevant metrics.'
    ),
  userPreferences: z
    .string()
    .optional()
    .describe('Optional user preferences or goals to consider during analysis.'),
});

export type AnalyzeHabitsInput = z.infer<typeof AnalyzeHabitsInputSchema>;

const AnalyzeHabitsOutputSchema = z.object({
  summary: z.string().describe('A summary of the habit completion data.'),
  suggestions: z.array(z.string()).describe('Personalized suggestions for improving the routine.'),
});

export type AnalyzeHabitsOutput = z.infer<typeof AnalyzeHabitsOutputSchema>;

export async function analyzeHabits(input: AnalyzeHabitsInput): Promise<AnalyzeHabitsOutput> {
  return analyzeHabitsFlow(input);
}

const analyzeHabitsPrompt = ai.definePrompt({
  name: 'analyzeHabitsPrompt',
  input: {schema: AnalyzeHabitsInputSchema},
  output: {schema: AnalyzeHabitsOutputSchema},
  prompt: `You are an AI personal development assistant. Analyze the following habit data and provide a summary and personalized suggestions for improvement.

Habit Data:
{{habitData}}

User Preferences (optional):
{{userPreferences}}

Based on this data, generate a concise summary of the user's habit completion and provide a list of actionable suggestions to improve their routine. Consider factors such as consistency, frequency, and any stated user preferences. Return the suggestions in an array.

Summary:

Suggestions:`, // Ensure suggestions are returned in an array format.
});

const analyzeHabitsFlow = ai.defineFlow(
  {
    name: 'analyzeHabitsFlow',
    inputSchema: AnalyzeHabitsInputSchema,
    outputSchema: AnalyzeHabitsOutputSchema,
  },
  async input => {
    const {output} = await analyzeHabitsPrompt(input);
    return output!;
  }
);
