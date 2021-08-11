import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageGateway } from './message.gateway';
import { MessageSchema } from './schema/message.schema';
import { MessageService } from './message.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConnectionModule } from 'src/connection/connection.module';
import { RoomModule } from 'src/room/room.module';
import { ServerModule } from 'src/server/server.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'message', schema: MessageSchema }]),
    forwardRef(() => RoomModule),
    AuthModule,
    UserModule,
    ConnectionModule,
    ServerModule,
  ],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
