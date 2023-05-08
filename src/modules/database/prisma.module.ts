import { type DynamicModule, Global, Module, Logger } from '@nestjs/common';
import { PRISMA_OPTIONS } from '../../constants/config';
import { PrismaService } from './prisma.service';

@Module({})
@Global()
export class PrismaModule {
  static forRoot(): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_OPTIONS,
          useValue: undefined,
        },
        PrismaService,
        Logger,
      ],
      exports: [PrismaService],
    };
  }
}
