import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { PromptBuilder } from './prompt.builder';
import { ResponseParser, type ParsedSchedule } from './response.parser';

const fallbackSchedule = (
  city: string,
  neighborhood: string | null,
): ParsedSchedule => ({
  city,
  neighborhood,
  source: 'not found',
  confidence: 'low',
  days: [],
});

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async fetchSchedule(
    city: string,
    state: string,
    country: string,
    neighborhood: string | null,
  ): Promise<ParsedSchedule> {
    try {
      const prompt = PromptBuilder.build(city, state, country, neighborhood);

      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text ?? '';
      return ResponseParser.parse(text, city, neighborhood);
    } catch (err) {
      this.logger.error(
        `Gemini fetch failed for ${city}, ${country}: ${String(err)}`,
      );
      return fallbackSchedule(city, neighborhood);
    }
  }
}
