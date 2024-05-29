import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder({
    moduleName: 'CloudflareModule',
  })
    .setClassMethodName('forRoot')
    .build();
