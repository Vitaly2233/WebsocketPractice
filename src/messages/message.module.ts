import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MessageGateway } from './message.gateway';
import { MessageSchema } from './schemas/message.schema';
import { RoomSchema } from '../chat-interface/schema/room.schema';
import { secretValue } from 'src/constants/jwt.constants';
import { MessageService } from './message.service';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [
    MongooseModule.forFeature([{ name: 'message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [MessageService],
})
export class MessageModule {}
