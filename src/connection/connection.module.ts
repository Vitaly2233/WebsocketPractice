import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { RoomSchema } from 'src/room/schema/room.schema';
import config from 'src/common/config';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionService } from './connection.service';

@Module({
  imports: [
    JwtModule.register({
      secret: config.JWT.SECRET,
      signOptions: { expiresIn: config.JWT.EXPIRES_IN },
    }),
    UserModule,
    AuthModule,
    RoomModule,
  ],
  providers: [ConnectionService, ConnectionGateway],
  exports: [ConnectionService],
})
export class ConnectionModule {}
