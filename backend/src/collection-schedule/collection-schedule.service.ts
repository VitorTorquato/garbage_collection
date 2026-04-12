import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionScheduleDto } from './dto/create-collection-schedule.dto';
import { getUpcomingDays } from './utils/upcoming-dates.util';

@Injectable()
export class CollectionScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.collectionSchedule.findMany({ where: { userId } });
  }

  async create(userId: number, dto: CreateCollectionScheduleDto) {
    const existing = await this.prisma.collectionSchedule.findUnique({
      where: { userId_trashType: { userId, trashType: dto.trashType as any } },
    });
    if (existing) {
      throw new ConflictException(
        `You already have a schedule for ${dto.trashType}`,
      );
    }
    return this.prisma.collectionSchedule.create({
      data: { userId, trashType: dto.trashType as any },
    });
  }

  async remove(scheduleId: number, userId: number) {
    const schedule = await this.prisma.collectionSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.userId !== userId) throw new ForbiddenException('Access denied');
    return this.prisma.collectionSchedule.delete({ where: { id: scheduleId } });
  }

  async getDashboard(userId: number, days: number) {
    const schedules = await this.prisma.collectionSchedule.findMany({
      where: { userId },
    });

    const trashTypes = schedules.map((s) => s.trashType as string);

    const fromDate = new Date();
    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + days);

    return {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      days: getUpcomingDays(trashTypes, fromDate, days),
    };
  }
}
