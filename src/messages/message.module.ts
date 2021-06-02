import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { MessageSchema } from './schemas/message.schema';
import { RoomSchema } from '../chatInterface/shemas/room.schema';
import { GuardConnections } from './active-connected.service';

@Module({
  providers: [ChatGateway, GuardConnections],
  imports: [
    MongooseModule.forFeature([{ name: 'ms', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
  ],
  exports: [ChatGateway],
})
export class MessageModule {}
