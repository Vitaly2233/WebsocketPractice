import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { ConnectionService } from './connection.service';

@WebSocketGateway()
export class ConnectionGateway implements OnGatewayConnection {
  constructor(private connectionService: ConnectionService) {}
  async handleConnection(client: ISocketClient) {
    const cookie: string | undefined = client?.handshake?.headers?.cookie;
    if (!cookie) return client.disconnect();
    return await this.connectionService.handleConnection(client, cookie);
  }
  async handleDisconnect(client: ISocketClient) {
    return await this.connectionService.deleteActiveConnected(client);
  }
}
