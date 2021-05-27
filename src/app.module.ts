import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), MessageModule],
})
export class AppModule {}
