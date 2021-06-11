import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MessageGateway } from './message.gateway';
import { MessageSchema } from './schema/message.schema';
import { RoomSchema } from '../chat-interface/schema/room.schema';
import { secretValue } from 'src/constants/jwt.constants';
import { MessageService } from './message.service';
import { UserSchema } from 'src/auth/Schema/user.schema';
import { ChatInterfaceModule } from 'src/chat-interface/chat-interface.module';
import { MongooseHelpModule } from 'src/mongoose-help/mongoose-help.module';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [
    MongooseHelpModule,
    MongooseModule.forFeature([
      { name: 'message', schema: MessageSchema },
      { name: 'room', schema: RoomSchema },
      { name: 'user', schema: UserSchema },
    ]),
    JwtModule.register({
      secret: secretValue,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => ChatInterfaceModule),
  ],
  exports: [MessageService],
})
export class MessageModule {}
