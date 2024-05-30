import { Module } from '@nestjs/common';

// controllers
import { DraftsController } from './controllers/drafts.controller';

// services
import { DraftsService } from './services/drafts.service';
import { PostsService } from '../posts/services/posts.service';
import { TagsService } from '../tags/services/tags.service';
import { PasswordService } from '../auth/services/password.service';

@Module({
  controllers: [DraftsController],
  providers: [DraftsService, PostsService, TagsService, PasswordService],
})
export class DraftsModule {}
