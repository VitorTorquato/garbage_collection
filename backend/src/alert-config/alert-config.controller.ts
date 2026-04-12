import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AlertConfigService } from './alert-config.service';
import { UpsertAlertConfigDto } from './dto/upsert-alert-config.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('alert-config')
export class AlertConfigController {
  constructor(private readonly service: AlertConfigService) {}

  @Get()
  getConfig(@TokenPayloadParam() token: PayloadTokenDto) {
    return this.service.getConfig(token.sub);
  }

  @Put()
  upsertConfig(
    @Body() dto: UpsertAlertConfigDto,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.upsertConfig(token.sub, dto);
  }
}
