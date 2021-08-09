import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from 'src/messages/message.module';
import { RoomSchema } from 'src/room/schema/room.schema';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { RoomService } from './room.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
    MessageModule,
  ],
  providers: [RoomService],
})
export class RoomModule {}
