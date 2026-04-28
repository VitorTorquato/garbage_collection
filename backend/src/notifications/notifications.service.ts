import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertNotificationPrefsDto } from './dto/upsert-notification-prefs.dto';
import { getUpcomingDays } from '../collection-schedule/utils/upcoming-dates.util';
import * as twilio from 'twilio';

const TRASH_LABELS: Record<string, string> = {
  organic: 'Organic',
  mixed: 'Mixed',
  recyclable: 'Recyclable',
  glass: 'Glass',
};

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly twilioClient: twilio.Twilio;
  private readonly fromNumber: string;
  private readonly appTimezone = process.env.APP_TIMEZONE ?? 'Europe/Malta';

  constructor(private readonly prisma: PrismaService) {
    this.twilioClient = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
  }

  async getPreferences(userId: number) {
    const [prefs, user] = await Promise.all([
      this.prisma.notificationPreference.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { phoneNumber: true } }),
    ]);
    return {
      ...(prefs ?? { enabled: false, notificationTime: '08:00' }),
      phoneNumber: user?.phoneNumber ?? null,
    };
  }

  async upsertPreferences(userId: number, dto: UpsertNotificationPrefsDto) {
    const { phoneNumber, ...prefsData } = dto;

    const [prefs] = await this.prisma.$transaction([
      this.prisma.notificationPreference.upsert({
        where: { userId },
        create: { userId, ...prefsData },
        update: { ...prefsData },
      }),
      ...(phoneNumber !== undefined
        ? [this.prisma.user.update({ where: { id: userId }, data: { phoneNumber } })]
        : []),
    ]);

    return { ...prefs, phoneNumber: phoneNumber ?? null };
  }

  async sendWhatsApp(phoneNumber: string, message: string) {
    const to = phoneNumber.startsWith('whatsapp:')
      ? phoneNumber
      : `whatsapp:${phoneNumber}`;

    return this.twilioClient.messages.create({
      from: this.fromNumber,
      to,
      body: message,
    });
  }

  async buildAndSendNotification(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { collectionSchedules: true },
    });

    if (!user?.phoneNumber) {
      this.logger.log(`Skipping user ${userId}: missing phone number`);
      return;
    }
    if (!user.collectionSchedules.length) {
      this.logger.log(`Skipping user ${userId}: no collection schedules`);
      return;
    }

    const trashTypes = user.collectionSchedules.map((s) => s.trashType as string);
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: this.appTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dateParts = dateFormatter.formatToParts(now);
    const year = dateParts.find((p) => p.type === 'year')?.value ?? '1970';
    const month = dateParts.find((p) => p.type === 'month')?.value ?? '01';
    const day = dateParts.find((p) => p.type === 'day')?.value ?? '01';
    const today = new Date(`${year}-${month}-${day}T00:00:00`);
    const todayStr = localDateString(today);

    const todayEntry = getUpcomingDays(trashTypes, today, 1).find(
      (d) => d.date === todayStr,
    );

    if (!todayEntry) {
      this.logger.log(
        `Skipping user ${userId}: no collection today (${todayStr}) for configured trash types`,
      );
      return;
    }

    const typeNames = todayEntry.trashTypes
      .map((t) => TRASH_LABELS[t] ?? t)
      .join(' and ');

    const bin = todayEntry.trashTypes.length > 1 ? 'garbages' : 'garbage';

    const message = `Hi ${user.name}! Today is ${typeNames} collection day. Don't forget to put your ${bin} out!`;

    const sendResult = await this.sendWhatsApp(user.phoneNumber, message);
    this.logger.log(`Twilio message queued for user ${userId}: sid=${sendResult.sid}`);
  }
}
