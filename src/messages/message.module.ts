import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageGateway } from './message.gateway';
import { MessageSchema } from './schema/message.schema';
import { RoomSchema } from '../chat-interface/schema/room.schema';
import { MessageService } from './message.service';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { ChatInterfaceModule } from 'src/chat-interface/chat-interface.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionService } from 'src/connection/connection.service';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [
    MongooseModule.forFeature([
      { name: 'message', schema: MessageSchema },
      { name: 'room', schema: RoomSchema },
      { name: 'user', schema: UserSchema },
    ]),
    AuthModule,
    ConnectionService,
  ],
  exports: [MessageService],
})
export class MessageModule {}
