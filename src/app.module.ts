import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import 'winston-daily-rotate-file';
import { join } from 'path';

import joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { UserModule } from './user/user.module';
import { AuthGuardModule } from './modules/auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FileModule } from './file/file.module';
import { R2Module } from './modules/r2/r2.module';
import { TagsModule } from './tags/tags.module';
import { WidgetModule } from './widget/widget.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const dailyRotateFile = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d',
  auditFile: 'audit.json',
  dirname:
    process.env.NODE_ENV === 'production'
      ? join(__dirname, '../logs/prod/')
      : join(__dirname, '../logs/dev/'), //path to where save lo
  level: 'error',
});

const errorStackTracerFormat = winston.format((info) => {
  if (info.meta && info.meta instanceof Error) {
    info.message = `${info.message} ${info.meta.stack}`;
  }
  return info;
});

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
      validationSchema: joi.object({
        NODE_ENV: joi
          .string()
          .valid('test', 'development', 'production')
          .required(),
        DEPLOY_GROUP: joi
          .string()
          .valid('local', 'development', 'production')
          .required(),
        DATABASE_URL: joi.string().required(),
        COOKIE_SECRET: joi.string().required(),
        PORT: joi.number().optional().default(8080),
        SALT_ROUNDS: joi.number().optional().default(8),
        CF_R2_URL: joi.string().required(),
        CF_R2_ACCESS_KEY: joi.string().required(),
        CF_R2_SECRET_ACCESS_KEY: joi.string().required(),
        CF_R2_BUCKET: joi.string().required(),
        CF_R2_PUBLIC_URL: joi.string().required(),
      }),
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        errorStackTracerFormat(),
      ),
      transports: [dailyRotateFile, new winston.transports.Console()],
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    R2Module.forRoot(),
    AuthGuardModule,
    AuthModule,
    UserModule,
    PostsModule,
    FileModule,
    TagsModule,
    WidgetModule,
    CommentsModule,
    NotificationsModule,
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
export class AppModule {}
