import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';

// service
import { UserService } from './services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
