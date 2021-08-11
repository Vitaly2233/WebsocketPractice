import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { CurrentRoomGuard } from 'src/common/guard/current-room.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';

@WebSocketGateway()
@UseFilters(WsExceptionFilter)
export class RoomGateway {
  constructor(private roomServie: RoomService) {}

  @UseGuards(CurrentRoomGuard)
  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: ISocketClient) {
    const room = client.userData.room;
    return await this.roomServie.connect(client.userData.user, room, client);
  }

  @SubscribeMessage('closeRoom')
  @UseGuards(CurrentRoomGuard)
  async closeRoom(@ConnectedSocket() client: ISocketClient) {
    return this.roomServie.close(
      client,
      client.userData.user._id,
      client.userData.room._id,
    );
  }

  @WebSocketServer() server;

  @SubscribeMessage('createNewRoom')
  async createNewRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() body: CreateRoomDto,
  ) {
    body.participantUsernames.push(client.userData.user.username);
    return this.roomServie.create(
      body.roomName,
      body.participantUsernames,
      this.server,
    );
  }
}
