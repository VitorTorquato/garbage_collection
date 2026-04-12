import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionRepository } from './collection.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [PrismaModule, GeminiModule, GeocodingModule],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionRepository],
})
export class CollectionModule {}
