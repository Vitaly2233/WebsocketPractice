import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionService } from './connection.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => RoomModule),
    AuthModule,
  ],

  providers: [ConnectionService, ConnectionGateway],
  exports: [ConnectionService],
})
export class ConnectionModule {}
