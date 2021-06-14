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
import { CreateRoomDto } from './interface/create-room.dto';
import { IUserRoom } from './interface/user-rooms.interface';

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

  @SubscribeMessage('createNewRoom')
  async createNewRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() body: CreateRoomDto,
  ): Promise<IUserRoom[]> {
    body.participantUsernames.push(client.userData.user.username);
    const result = this.chatInterfaceService.createRoom(
      body.roomName,
      body.participantUsernames,
      this.server,
    );
    if (!result) throw new WsException('user was not found');

    const chats = await this.chatInterfaceService.getUserRooms(client);

    return client.emit<IUserRoom[]>('getUserRooms', chats);
  }

  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: ISocketClient) {
    const room = client.userData.room;
    await this.connectionSevice.connectToTheRoom(client.userData, room);

    const messages = await this.messageService.getAllMessages(
      client.userData,
      room,
    );
    client.emit('getAllMessages', messages);

    return await client.join(room._id);
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
