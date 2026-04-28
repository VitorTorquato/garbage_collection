import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);
  private readonly appTimezone = process.env.APP_TIMEZONE ?? 'Europe/Malta';

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotifications() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.appTimezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(now);
    const weekdayPart = parts.find((p) => p.type === 'weekday')?.value.toLowerCase();
    const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '00';
    const currentDay = WEEKDAYS.includes(weekdayPart ?? '') ? weekdayPart! : WEEKDAYS[now.getDay()];
    const currentTime = `${hourPart}:${minutePart}`;

    this.logger.log(
      `Cron tick — tz: ${this.appTimezone}, day: ${currentDay}, time: ${currentTime}`,
    );

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
