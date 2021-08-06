import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { ISocketClient } from '../common/interface/socket-client';
// import { TokenGuard } from 'src/auth/guard/jwt.guard';
import { MessageService } from './message.service';
import { ConnectionService } from 'src/connection/connection.service';
import { IMessageFrontend } from './interface/message-frontend';
import { CurrentRoomGuard } from 'src/common/guard/current-room.guard';

@WebSocketGateway()
@UseGuards(CurrentRoomGuard)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    private connetionService: ConnectionService,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(@ConnectedSocket() client: ISocketClient) {
    const room = client.userData.room;
    const messages = await this.messageService.getAllMessages(
      client.userData,
      room,
    );
    return client.emit<IMessageFrontend>('getAllMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const { username } = client.userData.user;
    const currentRoom = client.userData.room;

    const messageFronted: IMessageFrontend =
      await this.messageService.saveMessage(username, currentRoom._id, text);
    const activeConnected = this.connetionService.getActiveConnected();
    await this.messageService.sendMessageToRoom(
      client,
      this.server,
      activeConnected,
      messageFronted,
    );
  }
}
