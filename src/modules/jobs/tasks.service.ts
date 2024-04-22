import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

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

      this.logger.debug('[CRON - draft-to-publish] success');
    } catch (error) {
      this.logger.error(error, this._contextName);
    } finally {
      this.logger.debug('[CRON - draft-to-publish] end');
    }
  }
}
