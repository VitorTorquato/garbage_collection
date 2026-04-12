import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionModule } from '../collection/collection.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CollectionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule {}

