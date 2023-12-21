import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { isEmpty } from '../../libs/assertion';

@Injectable()
export class TasksService {
  private _contextName = 'cron - scheduler';

  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'draft-to-publish',
    timeZone: 'Asia/Seoul',
  })
  async handleCronDraftToPublish() {
    // 생성된지 일주일이 지난 임시저장글은 삭제
    try {
      this.logger.debug('[CRON - draft-to-publish] start');

      // 현재시간보다 작거나 같은 임시저장글을 찾아서 게시글로 변경
      const now = new Date();

      const data = await this.prisma.post.findMany({
        select: {
          id: true,
          title: true,
          fk_user_id: true,
        },
        where: {
          publishingDate: {
            lte: now,
            not: null,
          },
          isDraft: true,
        },
      });

      if (data && !isEmpty(data)) {
        await this.prisma.post.updateMany({
          where: {
            id: {
              in: data.map((item) => item.id),
            },
          },
          data: {
            isDraft: false,
          },
        });
      }

      this.logger.debug('[CRON - draft-to-publish] success');
    } catch (error) {
      this.logger.error(error, this._contextName);
    } finally {
      this.logger.debug('[CRON - draft-to-publish] end');
    }
  }
}
