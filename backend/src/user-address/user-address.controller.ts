import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UpsertUserAddressDto } from './dto/upsert-user-address.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('users/:id/address')
export class UserAddressController {
  constructor(private readonly service: UserAddressService) {}

  @Get()
  getAddress(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.getAddress(id, token.sub);
  }

  @Put()
  upsertAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertUserAddressDto,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.upsertAddress(id, dto, token.sub);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.deleteAddress(id, token.sub);
  }
}
