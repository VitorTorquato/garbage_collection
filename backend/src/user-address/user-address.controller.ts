import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UpsertUserAddressDto } from './dto/upsert-user-address.dto';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@UseGuards(AuthTokeGuard)
@Controller('address')
export class UserAddressController {
  constructor(private readonly service: UserAddressService) {}

  @Get()
  getAddress(@TokenPayloadParam() token: PayloadTokenDto) {
    return this.service.getAddress(token.sub, token.sub);
  }

  @Patch()
  upsertAddress(
    @Body() dto: UpsertUserAddressDto,
    @TokenPayloadParam() token: PayloadTokenDto,
  ) {
    return this.service.upsertAddress(token.sub, dto, token.sub);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@TokenPayloadParam() token: PayloadTokenDto) {
    return this.service.deleteAddress(token.sub, token.sub);
  }
}
