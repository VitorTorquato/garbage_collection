import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { LookupQuerySchema, type LookupQuery } from './dto/lookup-query.dto';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import type { ScheduleResponse } from './dto/schedule-response.dto';

@Controller('collection')
@UseGuards(ApiKeyGuard)
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get('lookup')
  lookup(
    @Query(new ZodValidationPipe(LookupQuerySchema)) query: LookupQuery,
  ): Promise<ScheduleResponse> {
    return this.service.lookup(query);
  }
}
