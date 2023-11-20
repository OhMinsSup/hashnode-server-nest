import { Global, Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './serialize.module-definition';
import { SerializeService } from './serialize.service';

@Global()
@Module({
  providers: [SerializeService],
  exports: [SerializeService],
})
export class SerializeModule extends ConfigurableModuleClass {}
