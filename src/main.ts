import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import config from 'src/common/config';
import { SocketAdapter } from './socket.adapter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useWebSocketAdapter(new SocketAdapter(app));
  console.log('application started on port:', config.SERVER_PORT);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.SERVER_PORT);
}
bootstrap();
