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
        PORT: joi.number().optional().default(8000),
        SALT_ROUNDS: joi.number().optional().default(8),
      }),
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    AuthGuardModule,
    AuthModule,
    UserModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
