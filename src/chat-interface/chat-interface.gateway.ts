import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { CookieParserInterceptor } from 'src/messages/interceptor/cookie-parser.interceptor';
import { ExceptionInterceptor } from 'src/messages/interceptor/exception.interceptor';
import { MessageService } from 'src/messages/message.service';
import { TokenGuard } from 'src/messages/message.token.guard';
import { ConnectionService } from './connection.service';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(CookieParserInterceptor, ExceptionInterceptor)
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private connectionSevice: ConnectionService,
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
    const chats = await this.messageService.getUserRooms(client);
    return client.emit('getUserRooms', chats);
  }

  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: ISocketClient) {
    return await this.connectionSevice.connectToTheRoom(
      client,
      client.userData.room,
    );
  }
}
