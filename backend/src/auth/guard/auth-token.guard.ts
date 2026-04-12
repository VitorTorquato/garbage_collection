import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { REQUETS_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthTokeGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number; email: string }>(
        token,
        this.jwtConfiguration,
      );

      (request as unknown as Record<string, unknown>)[REQUETS_TOKEN_PAYLOAD_NAME] = payload;

      const user = await this.prismaService.user.findFirst({
        where: { id: payload.sub },
      });

      if (!user?.active) {
        throw new UnauthorizedException('User account is inactive');
      }
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }

  private extractTokenHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') return undefined;
    return authorization.split(' ')[1];
  }
}
