import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';

import { CreateBody } from './dto/create';
import type { UserWithInfo } from '../modules/database/select/user.select';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(user: UserWithInfo, postId: number, body: CreateBody) {}
}
