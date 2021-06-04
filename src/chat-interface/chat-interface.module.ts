import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { secretValue } from 'src/constants/jwt.constants';
import { MessageModule } from 'src/messages/message.module';
import { MessageService } from 'src/messages/message.service';
import { ChatInterfaceGateWay } from './chat-interface.gateway';
import { ChatInterfaceService } from './chat-interface.service';
import { RoomSchema } from './schema/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'room', schema: RoomSchema },
    ]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
    MessageModule,
  ],
  providers: [ChatInterfaceService, ChatInterfaceGateWay],
})
export class ChatInterfaceModule {}
