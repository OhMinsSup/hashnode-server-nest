import { type DynamicModule, Global, Module } from '@nestjs/common';
import { R2_OPTIONS } from '../../constants/config';
import { R2Service } from './r2.service';

@Module({})
@Global()
export class R2Module {
  static forRoot(): DynamicModule {
    return {
      module: R2Module,
      providers: [
        {
          provide: R2_OPTIONS,
          useValue: undefined,
        },
        R2Service,
      ],
      exports: [R2Service],
    };
  }
}
