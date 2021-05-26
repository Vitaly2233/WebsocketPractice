import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './messages/chat.gateway';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), MessageModule],
})
export class AppModule {}
