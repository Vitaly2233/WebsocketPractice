import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ISocketClient } from '../common/interface/socket-client';
import { MessageService } from './message.service';
import { IMessageResponse } from './interface/message-response';
import { CurrentRoomGuard } from 'src/common/guard/current-room.guard';
import { Types } from 'mongoose';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { JwtGuard } from 'src/common/guard/jwt.guard';

@WebSocketGateway()
@UseFilters(WsExceptionFilter)
@UseGuards(JwtGuard, CurrentRoomGuard)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(@ConnectedSocket() client: ISocketClient) {
    const room = client.userData.room;
    const messages = await this.messageService.getAllInRoom(
      client.userData.user.username,
      room,
    );
    client.emit<IMessageResponse>('getAllMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const { username } = client.userData.user;
    const { _id, name, participants } = client.userData.room;

    await this.messageService.sendToRoom(
      username,
      name,
      _id,
      participants as Types._ObjectId[],
      text,
    );
  }
}
