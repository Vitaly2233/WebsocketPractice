import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { secretValue } from 'src/constants/jwt.constants';
import { MessageModule } from 'src/messages/message.module';
import { ChatInterfaceGateWay } from './chat-interface.gateway';
import { ConnectionService } from './connection.service';
import { RoomSchema } from './schema/room.schema';
import { ChatInterfaceService } from './chat-interface.service';
import { MessageSchema } from 'src/messages/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'room', schema: RoomSchema },
      { name: 'message', schema: MessageSchema },
    ]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => MessageModule),
  ],
  providers: [ConnectionService, ChatInterfaceGateWay, ChatInterfaceService],
  exports: [ConnectionService],
})
export class ChatInterfaceModule {}
