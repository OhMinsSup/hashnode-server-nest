import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, PrismaService],
})
export class WidgetModule {}
