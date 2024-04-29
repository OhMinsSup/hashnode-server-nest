import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';

// service
import { UserService } from './services/user.service';
import { TagsService } from '../tags/services/tags.service';

@Module({
  controllers: [UserController],
  providers: [UserService, TagsService],
})
export class UserModule {}
