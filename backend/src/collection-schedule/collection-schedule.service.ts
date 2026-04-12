import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionScheduleDto } from './dto/create-collection-schedule.dto';
import { UpdateCollectionScheduleDto } from './dto/update-collection-schedule.dto';
import { getUpcomingDays } from './utils/upcoming-dates.util';
import { MonthlyRule } from './types/monthly-rule.type';

@Injectable()
export class CollectionScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.collectionSchedule.findMany({ where: { userId } });
  }

  create(userId: number, dto: CreateCollectionScheduleDto) {
    return this.prisma.collectionSchedule.create({
      data: {
        userId,
        trashType: dto.trashType as any,
        frequencyType: dto.frequencyType as any,
        weekdays: dto.weekdays ?? [],
        monthlyRules: dto.monthlyRules
          ? (dto.monthlyRules as unknown as any)
          : undefined,
      },
    });
  }

  async update(
    scheduleId: number,
    userId: number,
    dto: UpdateCollectionScheduleDto,
  ) {
    await this.findAndVerifyOwnership(scheduleId, userId);
    return this.prisma.collectionSchedule.update({
      where: { id: scheduleId },
      data: {
        ...(dto.trashType && { trashType: dto.trashType as any }),
        ...(dto.frequencyType && { frequencyType: dto.frequencyType as any }),
        ...(dto.weekdays !== undefined && { weekdays: dto.weekdays }),
        ...(dto.monthlyRules !== undefined && {
          monthlyRules: dto.monthlyRules as unknown as any,
        }),
      },
    });
  }

  async remove(scheduleId: number, userId: number) {
    await this.findAndVerifyOwnership(scheduleId, userId);
    return this.prisma.collectionSchedule.delete({ where: { id: scheduleId } });
  }

  async getDashboard(userId: number, days: number) {
    const schedules = await this.prisma.collectionSchedule.findMany({
      where: { userId },
    });

    const inputs = schedules.map((s) => ({
      trashType: s.trashType,
      frequencyType: s.frequencyType,
      weekdays: s.weekdays,
      monthlyRules: (s.monthlyRules as unknown as MonthlyRule[]) ?? null,
    }));

    const fromDate = new Date();
    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + days);

    return {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      days: getUpcomingDays(inputs, fromDate, days),
    };
  }

  private async findAndVerifyOwnership(scheduleId: number, userId: number) {
    const schedule = await this.prisma.collectionSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.userId !== userId) throw new ForbiddenException('Access denied');
    return schedule;
  }
}
