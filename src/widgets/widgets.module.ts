import { Module } from '@nestjs/common';
import { WidgetsController } from './controllers/widgets.controller';
import { WidgetsService } from './services/widgets.service';

@Module({
  controllers: [WidgetsController],
  providers: [WidgetsService],
})
export class WidgetsModule {}
