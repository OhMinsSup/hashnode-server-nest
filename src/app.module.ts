import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
import { DraftsModule } from './drafts/drafts.module';
import { WidgetModule } from './widget/widget.module';

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
    DraftsModule,
    WidgetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
