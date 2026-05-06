import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpsertNotificationPrefsDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'notificationTime must be in HH:MM format' })
  notificationTime: string;

  @IsBoolean()
  @IsOptional()
  notifyDayBefore?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phoneNumber must be a valid phone number' })
  phoneNumber?: string;
}
