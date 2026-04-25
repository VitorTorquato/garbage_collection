import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotifications() {
    const now = new Date();
    const currentDay = WEEKDAYS[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    this.logger.log(`Cron tick — day: ${currentDay}, time: ${currentTime}`);

    const duePreferences = await this.prisma.notificationPreference.findMany({
      where: {
        enabled: true,
        notificationTime: currentTime,
      },
    });

    this.logger.log(`Found ${duePreferences.length} user(s) due for notification`);

    for (const pref of duePreferences) {
      try {
        await this.notificationsService.buildAndSendNotification(pref.userId);
        this.logger.log(`Notification sent to user ${pref.userId}`);
      } catch (err) {
        this.logger.error(`Failed to notify user ${pref.userId}: ${err}`);
      }
    }
  }
}
