import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import config from 'src/common/config';
import { WsExceptionFilter } from './common/filter/ws-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  console.log('application started on port:', config.SERVER_PORT);
  await app.listen(config.SERVER_PORT);
}
bootstrap();
