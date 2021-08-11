import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/common/config';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionService } from './connection.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => RoomModule),
    JwtModule.register({
      secret: config.JWT.SECRET,
      signOptions: { expiresIn: config.JWT.EXPIRES_IN },
    }),
  ],

  providers: [ConnectionService, ConnectionGateway],
  exports: [ConnectionService],
})
export class ConnectionModule {}
