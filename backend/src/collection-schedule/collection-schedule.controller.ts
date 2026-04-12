import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollectionScheduleService } from './collection-schedule.service';
import { CreateCollectionScheduleDto } from './dto/create-collection-schedule.dto';
import { UpdateCollectionScheduleDto } from './dto/update-collection-schedule.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('collection-schedules')
export class CollectionScheduleController {
  constructor(private readonly service: CollectionScheduleService) {}

  // Must be registered before /:scheduleId to avoid route conflict
  @Get('dashboard')
  getDashboard(
    @TokenPayloadParam() token: PayloadTokenDto,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const safeDays = Math.min(Math.max(days, 1), 90);
    return this.service.getDashboard(token.sub, safeDays);
  }

  @Get()
  findAll(@TokenPayloadParam() token: PayloadTokenDto) {
    return this.service.findAll(token.sub);
  }

  @Post()
  create(
    @Body() dto: CreateCollectionScheduleDto,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.create(token.sub, dto);
  }

  @Patch(':scheduleId')
  update(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() dto: UpdateCollectionScheduleDto,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.update(scheduleId, token.sub, dto);
  }

  @Delete(':scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.remove(scheduleId, token.sub);
  }
}
