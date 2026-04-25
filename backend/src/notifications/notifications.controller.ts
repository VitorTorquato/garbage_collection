import { Body, Controller, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpsertNotificationPrefsDto } from './dto/upsert-notification-prefs.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import type { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  getPreferences(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    return this.notificationsService.getPreferences(tokenPayload.sub);
  }

  @Put('preferences')
  upsertPreferences(
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
    @Body() dto: UpsertNotificationPrefsDto,
  ) {
    return this.notificationsService.upsertPreferences(tokenPayload.sub, dto);
  }

  @Post('test')
  @HttpCode(200)
  async sendTest(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    await this.notificationsService.buildAndSendNotification(tokenPayload.sub);
    return { message: 'Test notification sent' };
  }
}
