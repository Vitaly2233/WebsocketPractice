import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from './pipes/validation.pipe';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const HttpServer = await NestFactory.create<NestExpressApplication>(
    AuthModule,
  );
  HttpServer.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(8080);
  await HttpServer.listen(8081);
}
bootstrap();
