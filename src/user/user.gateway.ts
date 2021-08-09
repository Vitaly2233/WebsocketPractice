import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RoomService } from 'src/room/room.service';
import { UserService } from './user.service';

@WebSocketGateway()
@UseGuards(JwtAuthGuard)
export class RoomGateway {
  constructor(private userService: UserService) {}

  @SubscribeMessage('getUserRooms')
  async getUserRooms(@ConnectedSocket() client: ISocketClient) {
    return await this.userService.getUserRooms(client.userData.user._id);
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
