import {
  IsEnum,
  IsArray,
  ArrayMinSize,
  ValidateIf,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

class MonthlyRuleDto {
  @IsIn(['first', 'second', 'third', 'fourth', 'last'])
  week: string;

  @IsIn(WEEKDAYS)
  weekday: string;
}

export class CreateCollectionScheduleDto {
  @IsEnum(['organic', 'mixed', 'recyclable', 'glass'])
  trashType: string;

  @IsEnum(['weekly', 'monthly'])
  frequencyType: string;

  @ValidateIf((o) => o.frequencyType === 'weekly')
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEEKDAYS, { each: true })
  weekdays?: string[];

  @ValidateIf((o) => o.frequencyType === 'monthly')
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MonthlyRuleDto)
  monthlyRules?: MonthlyRuleDto[];
}
