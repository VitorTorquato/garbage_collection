import { Logger } from '@nestjs/common';
import { z } from 'zod';

const CollectionDaySchema = z.object({
  type: z.enum(['organic', 'recyclable', 'special']),
  weekdays: z.array(
    z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]),
  ),
  startTime: z.string().nullable(),
  notes: z.string().nullable(),
});

export const ParsedScheduleSchema = z.object({
  city: z.string(),
  neighborhood: z.string().nullable(),
  source: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  days: z.array(CollectionDaySchema),
});

export type ParsedSchedule = z.infer<typeof ParsedScheduleSchema>;

export type CollectionDayParsed = z.infer<typeof CollectionDaySchema>;

const fallback = (city: string, neighborhood: string | null): ParsedSchedule => ({
  city,
  neighborhood,
  source: 'not found',
  confidence: 'low',
  days: [],
});

export class ResponseParser {
  private static readonly logger = new Logger(ResponseParser.name);

  static parse(
    raw: string,
    city: string,
    neighborhood: string | null,
  ): ParsedSchedule {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('No JSON found in Gemini response');
        return fallback(city, neighborhood);
      }

      const parsed: unknown = JSON.parse(jsonMatch[0]);
      const result = ParsedScheduleSchema.safeParse(parsed);

      if (!result.success) {
        this.logger.warn(
          `Gemini response failed schema validation: ${result.error.message}`,
        );
        return fallback(city, neighborhood);
      }

      return result.data;
    } catch (err) {
      this.logger.warn(`Failed to parse Gemini response: ${String(err)}`);
      return fallback(city, neighborhood);
    }
  }
}
