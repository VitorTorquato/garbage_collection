import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthTokeGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload-param';
import type { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthTokeGuard)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedUser: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.userService.updateUser(id, updatedUser, tokenPayload);
  }

  @UseGuards(AuthTokeGuard)
  @Delete(':id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.userService.deleteUser(id, tokenPayload);
  }
}
