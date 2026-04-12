import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionScheduleDto } from './create-collection-schedule.dto';

export class UpdateCollectionScheduleDto extends PartialType(
  CreateCollectionScheduleDto,
) {}
