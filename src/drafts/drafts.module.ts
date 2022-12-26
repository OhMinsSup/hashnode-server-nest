import { Module } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { DraftsController } from './drafts.controller';
import { DraftsService } from './drafts.service';

@Module({
  controllers: [DraftsController],
  providers: [DraftsService, PrismaService],
})
export class DraftsModule {}
