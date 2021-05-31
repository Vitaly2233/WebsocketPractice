import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { MessageSchema } from './schemas/message.schema';
// import { RoomSchema } from './schemas/rooms.schema';

@Module({
  providers: [ChatGateway],
  imports: [
    MongooseModule.forFeature([{ name: 'ms', schema: MessageSchema }]),
    // MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
  ],
  exports: [ChatGateway],
})
export class MessageModule {}
