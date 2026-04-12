import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAlertConfigDto } from './dto/upsert-alert-config.dto';

@Injectable()
export class AlertConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(userId: number) {
    const config = await this.prisma.alertConfig.findUnique({
      where: { userId },
    });
    if (!config) throw new NotFoundException('Alert config not found');
    return config;
  }

  upsertConfig(userId: number, dto: UpsertAlertConfigDto) {
    return this.prisma.alertConfig.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
  }
}
