import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'clear temp drafts items',
    timeZone: 'Asia/Seoul',
  })
  async handleTempDraftsRemoveCron() {
    // 생성된지 일주일이 지난 임시저장글은 삭제
    this.logger.debug('Called every day at 10 AM');
    try {
      // const data = await this.prisma.postDraft.deleteMany({
      //   where: {
      //     createdAt: {
      //       lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      //     },
      //   },
      // });
      // this.logger.debug(`Removed ${data.count} temp drafts items`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
