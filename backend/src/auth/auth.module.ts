import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthTokeGuard } from './guard/auth-token.guard';
import { BcryptService } from './hash/bcrypt.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokeGuard,
    { provide: HashingServiceProtocol, useClass: BcryptService },
  ],
  exports: [
    AuthTokeGuard,
    JwtModule,
    ConfigModule,
    { provide: HashingServiceProtocol, useClass: BcryptService },
  ],
})
export class AuthModule {}
