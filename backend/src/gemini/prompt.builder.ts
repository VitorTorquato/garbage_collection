export class PromptBuilder {
  static build(
    city: string,
    state: string,
    country: string,
    neighborhood: string | null,
  ): string {
    const neighborhoodLine = neighborhood
      ? `- Neighborhood / District: ${neighborhood}`
      : '- Neighborhood: not specified — search for the city as a whole';

    return `You are an assistant specialized in municipal waste collection services worldwide.

Your task is to find and structure the garbage/waste collection schedule for:
- City: ${city}
- State / Region: ${state}
- Country: ${country}
${neighborhoodLine}

Search the official city council / municipality website or reliable government sources for:
1. Weekdays for ORGANIC / general waste collection
2. Weekdays for RECYCLABLE waste collection
3. Start time for each type of collection
4. Any relevant notes (holidays, exceptions, different zones)

Respond ONLY with a valid JSON, no markdown, no explanations, in this exact format:
{
  "city": "${city}",
  "neighborhood": ${neighborhood ? `"${neighborhood}"` : 'null'},
  "source": "URL where you found the information",
  "confidence": "high | medium | low",
  "days": [
    {
      "type": "organic | recyclable | special",
      "weekdays": ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
      "startTime": "HH:MM or null",
      "notes": "observation or null"
    }
  ]
}

If you cannot find reliable information, return confidence: "low" and days: [].
Never invent data. If unsure, set confidence to "low" or "medium".`;
  }
}
