import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from 'src/connection/connection.module';
import { MessageModule } from 'src/messages/message.module';
import { RoomSchema } from 'src/room/schema/room.schema';
import { UserModule } from 'src/user/user.module';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
    forwardRef(() => ConnectionModule),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
  ],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomModule {}
