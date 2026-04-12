import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CollectionScheduleService } from './collection-schedule.service';
import { CollectionScheduleController } from './collection-schedule.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CollectionScheduleController],
  providers: [CollectionScheduleService],
})
export class CollectionScheduleModule {}
