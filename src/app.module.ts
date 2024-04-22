import { Module, Logger, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TasksModule } from './modules/jobs/tasks.module';
import { PrismaModule } from './modules/database/prisma.module';

import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthenticationGuardModule } from './guards/authentication.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    IntegrationsModule,
    JwtModule.register({
      global: true,
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    CacheModule.register(),
    AuthenticationGuardModule,
    TasksModule,
    AuthModule,
    UserModule,
    HealthModule,
  ],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
