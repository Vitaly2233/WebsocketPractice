import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from 'src/chat-interface/schema/room.schema';
import config from 'src/common/config';
import { UserModule } from 'src/user/user.module';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionService } from './connection.service';

@Module({
  imports: [
    JwtModule.register({
      secret: config.JWT.SECRET,
      signOptions: { expiresIn: config.JWT.EXPIRES_IN },
    }),
    MongooseModule.forFeature([{ name: 'room', schema: RoomSchema }]),
    UserModule,
  ],
  providers: [ConnectionService, ConnectionGateway],
  exports: [ConnectionService],
})
export class ConnectionModule {}
