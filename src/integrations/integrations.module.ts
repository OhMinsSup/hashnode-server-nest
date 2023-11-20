import { Module } from '@nestjs/common';
import { EnvironmentModule } from './environment/environment.module';
import { SerializeModule } from './serialize/serialize.module';

@Module({
  imports: [EnvironmentModule.forRoot({}), SerializeModule.forRoot({})],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
