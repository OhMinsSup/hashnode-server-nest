import { Module } from '@nestjs/common';
import { WidgetsController } from './controllers/widgets.controller';
import { WidgetsService } from './services/widgets.service';
import { DraftsService } from '../drafts/services/drafts.service';
import { PostsService } from '../posts/services/posts.service';
import { TagsService } from '../tags/services/tags.service';
import { PasswordService } from '../auth/services/password.service';

@Module({
  controllers: [WidgetsController],
  providers: [
    WidgetsService,
    DraftsService,
    PostsService,
    TagsService,
    PasswordService,
  ],
})
export class WidgetsModule {}
