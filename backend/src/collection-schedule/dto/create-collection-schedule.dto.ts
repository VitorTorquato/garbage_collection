import { IsIn } from 'class-validator';

export class CreateCollectionScheduleDto {
  @IsIn(['organic', 'mixed', 'recyclable', 'glass'])
  trashType: string;
}
