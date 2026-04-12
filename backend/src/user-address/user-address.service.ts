import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertUserAddressDto } from './dto/upsert-user-address.dto';

@Injectable()
export class UserAddressService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddress(userId: number, requesterId: number) {
    this.enforceOwnership(userId, requesterId);
    const address = await this.prisma.userAddress.findUnique({
      where: { userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async upsertAddress(
    userId: number,
    dto: UpsertUserAddressDto,
    requesterId: number,
  ) {
    this.enforceOwnership(userId, requesterId);
    return this.prisma.userAddress.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
  }

  async deleteAddress(userId: number, requesterId: number) {
    this.enforceOwnership(userId, requesterId);
    const existing = await this.prisma.userAddress.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Address not found');
    return this.prisma.userAddress.delete({ where: { userId } });
  }

  private enforceOwnership(userId: number, requesterId: number) {
    if (userId !== requesterId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
