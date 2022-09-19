import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

// service
import { UserService } from './user.service';
import { PrismaService } from '../modules/database/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
