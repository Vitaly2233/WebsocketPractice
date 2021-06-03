import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/dto/user.schema';
import { secretValue } from 'src/constants/jwt.constants';
import { ChatInterfaceGateWay } from './chat-interface.gateway';
import { ConnectionsService } from './connection.service';
import { RoomSchema } from './shemas/room.schema';

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
  ],
  providers: [ConnectionsService, ChatInterfaceGateWay],
})
export class ChatInterfaceModule {}
