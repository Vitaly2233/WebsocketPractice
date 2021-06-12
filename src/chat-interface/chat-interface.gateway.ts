import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { SetCurrentRoomInterceptor } from 'src/interceptor/set-current-room.interceptor';
import { ExceptionInterceptor } from 'src/interceptor/exception.interceptor';
import { MessageService } from 'src/messages/message.service';
import { TokenGuard } from 'src/guard/token.guard';
import { ChatInterfaceService } from './chat-interface.service';
import { ConnectionService } from './connection.service';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(SetCurrentRoomInterceptor, ExceptionInterceptor)
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private connectionSevice: ConnectionService,
    private chatInterfaceService: ChatInterfaceService,
    private messageService: MessageService,
  ) {}

  @WebSocketServer() server;

  async handleConnection(client: ISocketClient) {
    return await this.connectionSevice.handleConnection(client);
  }
  async handleDisconnect(client: ISocketClient) {
    return await this.connectionSevice.deleteActiveConnected(client);
  }

  @SubscribeMessage('getUserRooms')
  async getUserRooms(@ConnectedSocket() client: ISocketClient) {
    const chats = await this.chatInterfaceService.getUserRooms(client);
    return client.emit('getUserRooms', chats);
  }

  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: ISocketClient) {
    return await this.connectionSevice.connectToTheRoom(
      client,
      client.userData.room,
    );
  }

  @SubscribeMessage('createNewRoom')
  async createNewRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() body: { participantUsernames: string[]; roomName: string },
  ) {
    body.participantUsernames.push(client.userData.user.username);
    const result = this.chatInterfaceService.createRoom(
      body.roomName,
      body.participantUsernames,
      this.server,
    );
    if (!result) throw new WsException('user was not found');
    client.emit('createNewRoom');
  }
}
