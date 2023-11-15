import { Module, Logger, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthGuardModule } from './modules/auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FileModule } from './file/file.module';
import { TagsModule } from './tags/tags.module';
import { WidgetModule } from './widget/widget.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './modules/jobs/tasks.module';
import { PrismaModule } from './modules/database/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: isDev
        ? '.env.development'
        : isProd
          ? '.env.production'
          : '.env',
    }),
    IntegrationsModule,
    PrismaModule,
    JwtModule.register({
      global: true,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register(),
    TasksModule,
    AuthGuardModule,
    AuthModule,
    UserModule,
    PostsModule,
    FileModule,
    TagsModule,
    WidgetModule,
    CommentsModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
