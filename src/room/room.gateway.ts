import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { CurrentRoomGuard } from 'src/common/guard/current-room.guard';
import { RoomService } from './room.service';

@WebSocketGateway()
export class RoomGateway {
  constructor(private roomServie: RoomService) {}

  @UseGuards(CurrentRoomGuard)
  @SubscribeMessage('closeRoom')
  async closeRoom(@ConnectedSocket() client: ISocketClient) {
    return this.roomServie.closeRoom(
      client,
      client.userData.user._id,
      client.userData.room._id,
    );
  }
}
