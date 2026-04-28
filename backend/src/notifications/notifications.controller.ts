import { Body, Controller, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { UpsertNotificationPrefsDto } from './dto/upsert-notification-prefs.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import type { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsScheduler: NotificationsScheduler,
  ) {}

  @Get('preferences')
  getPreferences(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    return this.notificationsService.getPreferences(tokenPayload.sub);
  }

  @Put('preferences')
  async upsertPreferences(
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
    @Body() dto: UpsertNotificationPrefsDto,
  ) {
    const result = await this.notificationsService.upsertPreferences(tokenPayload.sub, dto);
    if (dto.enabled) {
      this.notificationsScheduler.scheduleUser(tokenPayload.sub, dto.notificationTime);
    } else {
      this.notificationsScheduler.unscheduleUser(tokenPayload.sub);
    }
    return result;
  }

  @Post('test')
  @HttpCode(200)
  async sendTest(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    await this.notificationsService.buildAndSendNotification(tokenPayload.sub);
    return { message: 'Test notification sent' };
  }
}
