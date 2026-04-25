import { IsBoolean, IsString, Matches } from 'class-validator';

export class UpsertNotificationPrefsDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'notificationTime must be in HH:MM format' })
  notificationTime: string;
}
