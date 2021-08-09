import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { ConnectionService } from './connection.service';

@WebSocketGateway()
export class ConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private connectionService: ConnectionService) {}

  async handleConnection(client: ISocketClient) {
    // return await this.connectionService.handleConnection(client);
  }
  async handleDisconnect(client: ISocketClient) {
    // return await this.connectionService.deleteActiveConnected(client);
  }
}
