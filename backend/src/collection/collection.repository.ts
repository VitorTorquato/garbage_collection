import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import type { ParsedSchedule } from '../gemini/response.parser';

const scheduleInclude = { city: true, days: true } satisfies Prisma.ScheduleInclude;

export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: typeof scheduleInclude;
}>;

@Injectable()
export class CollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findValidSchedule(
    city: string,
    country: string,
    neighborhood: string | null,
  ): Promise<ScheduleWithRelations | null> {
    return this.prisma.schedule.findFirst({
      where: {
        city: { name: city, country },
        neighborhood: neighborhood ?? null,
        expiresAt: { gt: new Date() },
      },
      include: scheduleInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveSchedule(
    cityName: string,
    state: string,
    country: string,
    parsed: ParsedSchedule,
  ): Promise<ScheduleWithRelations> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const city = await this.prisma.city.upsert({
      where: { name_state_country: { name: cityName, state, country } },
      create: { name: cityName, state, country },
      update: {},
    });

    return this.prisma.schedule.create({
      data: {
        cityId: city.id,
        neighborhood: parsed.neighborhood,
        sourceUrl: parsed.source,
        confidence: parsed.confidence,
        expiresAt,
        days: {
          create: parsed.days.map((d) => ({
            type: d.type,
            weekdays: d.weekdays,
            startTime: d.startTime,
            notes: d.notes,
          })),
        },
      },
      include: scheduleInclude,
    });
  }
}
