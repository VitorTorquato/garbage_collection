import { IsBoolean, IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class UpsertAlertConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsInt()
  @Min(0)
  @Max(7)
  daysBeforeCollection: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'alertTime must be in HH:MM format' })
  alertTime: string;
}
