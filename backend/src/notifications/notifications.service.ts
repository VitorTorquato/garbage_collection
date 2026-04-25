import { Injectable, NotFoundException } from '@nestjs/common';
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
  private readonly twilioClient: twilio.Twilio;
  private readonly fromNumber: string;

  constructor(private readonly prisma: PrismaService) {
    this.twilioClient = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
  }

  async getPreferences(userId: number) {
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!prefs) throw new NotFoundException('Notification preferences not found');
    return prefs;
  }

  upsertPreferences(userId: number, dto: UpsertNotificationPrefsDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
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

    if (!user?.phoneNumber || !user.collectionSchedules.length) return;

    const trashTypes = user.collectionSchedules.map((s) => s.trashType as string);
    const today = new Date();
    const todayStr = localDateString(today);

    const todayEntry = getUpcomingDays(trashTypes, today, 1).find(
      (d) => d.date === todayStr,
    );

    if (!todayEntry) return;

    const typeNames = todayEntry.trashTypes
      .map((t) => TRASH_LABELS[t] ?? t)
      .join(' and ');

    const bin = todayEntry.trashTypes.length > 1 ? 'bins' : 'bin';

    const message = `Hi ${user.name}! Today is ${typeNames} collection day. Don't forget to put your ${bin} out!`;

    await this.sendWhatsApp(user.phoneNumber, message);
  }
}
