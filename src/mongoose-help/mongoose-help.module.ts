import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { ChatInterfaceModule } from 'src/chat-interface/chat-interface.module';
import { RoomSchema } from 'src/chat-interface/schema/room.schema';
import { MessageSchema } from 'src/messages/schema/message.schema';
import { MongooseHelpService } from './mongoose-help.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'message', schema: MessageSchema },
      { name: 'room', schema: RoomSchema },
      { name: 'user', schema: UserSchema },
    ]),
    ChatInterfaceModule,
  ],
  providers: [MongooseHelpService],
  exports: [MongooseHelpService],
})
export class MongooseHelpModule {}
