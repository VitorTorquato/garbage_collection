import { Injectable } from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { GeminiService } from '../gemini/gemini.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import type { LookupQuery } from './dto/lookup-query.dto';
import type { ScheduleResponse } from './dto/schedule-response.dto';
import type { ScheduleWithRelations } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(
    private readonly repository: CollectionRepository,
    private readonly gemini: GeminiService,
    private readonly geocoding: GeocodingService,
  ) {}

  async lookup(query: LookupQuery): Promise<ScheduleResponse> {
    const location = await this.geocoding.reverseGeocode(query.lat, query.lng);
    const { city, state, country, neighborhood } = location;

    const cached = await this.repository.findValidSchedule(
      city,
      country,
      neighborhood,
    );

    if (cached) {
      return this.toResponse(cached);
    }

    const parsed = await this.gemini.fetchSchedule(
      city,
      state,
      country,
      neighborhood,
    );

    const saved = await this.repository.saveSchedule(
      city,
      state,
      country,
      parsed,
    );

    return this.toResponse(saved);
  }

  private toResponse(schedule: ScheduleWithRelations): ScheduleResponse {
    return {
      city: schedule.city.name,
      state: schedule.city.state,
      country: schedule.city.country,
      neighborhood: schedule.neighborhood,
      source: schedule.sourceUrl,
      confidence: schedule.confidence,
      expiresAt: schedule.expiresAt.toISOString(),
      days: schedule.days.map((d) => ({
        type: d.type,
        weekdays: d.weekdays,
        startTime: d.startTime,
        notes: d.notes,
      })),
    };
  }
}
