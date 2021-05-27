import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { MessageSchema } from './schemas/message.schema';

@Module({
  providers: [ChatGateway],
  imports: [MongooseModule.forFeature([{ name: 'ms', schema: MessageSchema }])],
  exports: [ChatGateway],
})
export class MessageModule {}