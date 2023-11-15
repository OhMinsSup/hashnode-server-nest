import './libs/support';
import { NestFactory } from '@nestjs/core';
// import { utilities, WinstonModule } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
// import * as winston from 'winston';
// import { join } from 'path';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
// import DailyRotateFile from 'winston-daily-rotate-file';

import { PrismaService } from './modules/database/prisma.service';
import { VersionStrategy } from './constants/version';
import { AppModule } from './app.module';

// types
import type { NestExpressApplication } from '@nestjs/platform-express';

// const dailyOption = (level: string) => {
//   return {
//     filename: 'application-%DATE%.log',
//     datePattern: 'YYYY-MM-DD',
//     zippedArchive: false,
//     maxSize: '20m',
//     maxFiles: '14d',
//     auditFile: 'audit.json',
//     dirname:
//       process.env.NODE_ENV === 'production'
//         ? join(__dirname, `../logs/${level}/prod/`)
//         : join(__dirname, `../logs/${level}/dev/`), //path to where save lo
//     level,
//     format: winston.format.combine(
//       winston.format.timestamp(),
//       utilities.format.nestLike(process.env.NODE_ENV, {
//         colors: false,
//         prettyPrint: true,
//       }),
//     ),
//   };
// };

// const winstonLogger = WinstonModule.createLogger({
//   transports: [
//     new winston.transports.Console({
//       level: process.env.NODE_ENV === 'production' ? 'http' : 'debug',
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         utilities.format.nestLike(process.env.NODE_ENV, {
//           colors: true,
//           prettyPrint: true,
//         }),
//       ),
//     }),
//     new DailyRotateFile(dailyOption('warn')),
//     new DailyRotateFile(dailyOption('error')),
//   ],
// });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: winstonLogger,
  });

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableVersioning({
    defaultVersion: VersionStrategy.current,
    type: VersioningType.HEADER,
    header: 'X-API-Version',
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedHosts = [/^https:\/\/domain.io$/];
      if (config.get('NODE_ENV') === 'development') {
        allowedHosts.push(/^http:\/\/localhost/);
      }

      let corsOptions: any;
      const valid = allowedHosts.some((regex) => regex.test(origin));
      if (valid) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
      } else {
        corsOptions = { origin: false }; // disable CORS for this request
      }
      callback(null, corsOptions);
    },
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('API Document')
    .setDescription('API Document')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, document);

  app.use(helmet());
  app.use(cookieParser(config.get('COOKIE_SECRET')));
  app.use(compression());

  await app.listen(config.get('PORT'));
}
bootstrap();
