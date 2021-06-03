import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageGateway } from './message.gateway';
import { MessageSchema } from './schemas/message.schema';
import { RoomSchema } from '../chatInterface/shemas/room.schema';
import { JwtModule } from '@nestjs/jwt';
import { secretValue } from 'src/constants/jwt.constants';

@Module({
  providers: [MessageGateway],
  imports: [
    MongooseModule.forFeature([{ name: 'message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class MessageModule {}
