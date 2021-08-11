import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { UserService } from './user.service';

@WebSocketGateway()
// @UseGuards(JwtAuthGuard)
export class RoomGateway {
  constructor(private userService: UserService) {}

  @SubscribeMessage('getUserRooms')
  async getUserRooms(@ConnectedSocket() client: ISocketClient) {
    console.log('here');

    // throw new WsException('something is wrong');
    // return await this.userService.getUserRooms(client.userData.user._id);
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
