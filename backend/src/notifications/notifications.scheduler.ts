import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler implements OnModuleInit {
  private readonly logger = new Logger(NotificationsScheduler.name);
  private readonly appTimezone = process.env.APP_TIMEZONE ?? 'Europe/Malta';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { enabled: true },
    });
    for (const pref of prefs) {
      this.scheduleUser(pref.userId, pref.notificationTime);
    }
    this.logger.log(`Bootstrapped ${prefs.length} notification job(s)`);
  }

  scheduleUser(userId: number, notificationTime: string) {
    const [hour, minute] = notificationTime.split(':');
    const cronExpression = `${minute} ${hour} * * *`;
    const name = `notification-user-${userId}`;

    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.schedulerRegistry.deleteCronJob(name);
    }

    const job = new CronJob(
      cronExpression,
      () => {
        this.notificationsService
          .buildAndSendNotification(userId)
          .catch((err) => this.logger.error(`Failed to notify user ${userId}: ${err}`));
      },
      null,
      true,
      this.appTimezone,
    );

    this.schedulerRegistry.addCronJob(name, job);
    this.logger.log(`Scheduled notification for user ${userId} at ${notificationTime} (${this.appTimezone})`);
  }

  unscheduleUser(userId: number) {
    const name = `notification-user-${userId}`;
    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`Removed notification job for user ${userId}`);
    }
  }
}
