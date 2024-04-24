import { Module } from '@nestjs/common';

// controllers
import { TagsController } from './controllers/tags.controller';

// services
import { TagsService } from './services/tags.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
