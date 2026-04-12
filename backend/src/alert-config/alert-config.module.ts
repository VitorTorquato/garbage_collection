import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AlertConfigService } from './alert-config.service';
import { AlertConfigController } from './alert-config.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AlertConfigController],
  providers: [AlertConfigService],
})
export class AlertConfigModule {}
