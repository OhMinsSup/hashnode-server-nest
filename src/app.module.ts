import { Module, Logger, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TasksModule } from './modules/jobs/tasks.module';
import { PrismaModule } from './modules/database/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthenticationGuardModule } from './guards/authentication.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppController } from './app.controller';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { DraftsModule } from './drafts/drafts.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { dailyOption } from './modules/logging/winston';
import { FilesModule } from './files/files.module';
import { EnvironmentService } from './integrations/environment/environment.service';
import { WidgetsModule } from './widgets/widgets.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';

@Module({
  controllers: [AppController],
  imports: [
    IntegrationsModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'http' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(process.env.NODE_ENV, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        ...(process.env.NODE_ENV === 'production'
          ? [new DailyRotateFile(dailyOption('error'))]
          : []),
        // other transports...
      ],
      // other options
    }),
    JwtModule.register({
      global: true,
    }),
    PrismaModule,
    CloudflareModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [EnvironmentService],
      // @ts-expect-error - ignoreUserAgents is not defined in ThrottlerModuleOptions
      useFactory: async (environmentService: EnvironmentService) => {
        const throttleConfig = environmentService.getThrottleConfig();
        return {
          ttl: throttleConfig.ttl,
          limit: throttleConfig.limit,
          ignoreUserAgents: throttleConfig.ignoreUserAgents,
        };
      },
    }),
    CacheModule.register(),
    AuthenticationGuardModule,
    TasksModule,
    AuthModule,
    UserModule,
    HealthModule,
    PostsModule,
    TagsModule,
    DraftsModule,
    FilesModule,
    WidgetsModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
