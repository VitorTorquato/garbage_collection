import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HashingServiceProtocol } from '../auth/hash/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { PayloadTokenDto } from '../auth/dto/payload-toke.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(createUserDto.password);

      return await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash,
        },
        select: { id: true, name: true, email: true },
      });
    } catch {
      throw new HttpException('Falha ao cadastrar usuário', HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayload: PayloadTokenDto,
  ) {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (user.id !== tokenPayload.sub) {
      throw new HttpException(
        'Sem permissão para atualizar este usuário',
        HttpStatus.FORBIDDEN,
      );
    }

    const data: { name?: string; passwordHash?: string } = {
      name: updateUserDto.name ?? user.name,
    };

    if (updateUserDto.password) {
      data.passwordHash = await this.hashingService.hash(updateUserDto.password);
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, name: true, email: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async deleteUser(id: number, tokenPayload: PayloadTokenDto) {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (user.id !== tokenPayload.sub) {
      throw new HttpException(
        'Sem permissão para deletar este usuário',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.user.delete({ where: { id: user.id } });

    return { message: 'Usuário deletado com sucesso' };
  }
}
