import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { TokenGuard } from 'src/guards/token.guard';
import { ConnectionService } from './connection.service';

@WebSocketGateway()
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private connectionSevice: ConnectionService) {}

  @WebSocketServer() server;

  @UseGuards(TokenGuard)
  async handleConnection(client: ISocketClient) {
    // return await this.connectionSevice.handleConnection(client);
  }
  async handleDisconnect(client: ISocketClient) {
    // return await this.connectionSevice.deleteActiveConnected(client);
  }
}
