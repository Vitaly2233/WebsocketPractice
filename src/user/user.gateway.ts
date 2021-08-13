import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { JwtGuard } from 'src/common/guard/jwt.guard';
import { UserService } from './user.service';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';

@WebSocketGateway()
@UseFilters(WsExceptionFilter)
@UseGuards(JwtGuard)
export class RoomGateway {
  constructor(private userService: UserService) {}

  @SubscribeMessage('getUserRooms')
  async getUserRooms(@ConnectedSocket() client: ISocketClient) {
    console.log('getting user rooms');
    
    await client.emit('getUserRooms', await this.userService.getUserRooms(client.userData.user._id));
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
