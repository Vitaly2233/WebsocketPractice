import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { MessageModule } from 'src/messages/message.module';
import { ChatInterfaceGateWay } from './chat-interface.gateway';
import { RoomSchema } from './schema/room.schema';
import { ChatInterfaceService } from './chat-interface.service';
import { MessageSchema } from 'src/messages/schema/message.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [
    AuthModule,
    ConnectionModule,
    forwardRef(() => MessageModule),
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'room', schema: RoomSchema },
      { name: 'message', schema: MessageSchema },
    ]),
  ],
  providers: [ChatInterfaceGateWay, ChatInterfaceService],
})
export class ChatInterfaceModule {}
