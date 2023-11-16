import { Module, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostsModule } from './posts/posts.module';
import { FileModule } from './file/file.module';
import { TagsModule } from './tags/tags.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './modules/jobs/tasks.module';
import { PrismaModule } from './modules/database/prisma.module';

import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuthenticationGuardModule } from './guards/authentication.module';

@Module({
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
    PostsModule,
    FileModule,
    TagsModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
