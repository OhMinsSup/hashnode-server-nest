import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { INestApplication } from '@nestjs/common';

export type QueryEvent = {
  timestamp: Date;
  query: string; // Query sent to the database
  params: string; // Query parameters
  duration: number; // Time elapsed (in milliseconds) between client issuing query and database responding - not only time taken to run query
  target: string;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _contextName = 'prisma - database';

  constructor(private readonly logger: Logger) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();

    // @ts-ignore - this is a private property
    this.$on('query', (e: QueryEvent) => {
      this.logger.log('--------------------------------------------------');
      this.logger.log(`[Timestamp]: ` + e.timestamp, this._contextName);
      this.logger.log(`[Query]: ` + e.query, this._contextName);
      this.logger.log(`[Params]: ` + e.params, this._contextName);
      this.logger.log(`[Duration]: ` + `${e.duration} ms`, this._contextName);
      this.logger.log('--------------------------------------------------');
    });

    // @ts-ignore - this is a private property
    this.$on('error', (e: unknown) => {
      if (e instanceof Error) {
        this.logger.error(e.message, e.stack, this._contextName);
      }
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
