import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { INestApplication } from '@nestjs/common';

// type QueryEvent = {
//   timestamp: Date;
//   query: string; // Query sent to the database
//   params: string; // Query parameters
//   duration: number; // Time elapsed (in milliseconds) between client issuing query and database responding - not only time taken to run query
//   target: string;
// };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly logger: Logger) {
    super({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();

    // @ts-ignore
    this.$on('error', (e: any) => {
      this.logger.error(e.message, e.stack, 'PrismaService');
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
