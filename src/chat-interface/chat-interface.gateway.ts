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
import { CreateRoomDto } from './dto/create-room.dto';
import { IUserRoom } from './interface/user-rooms.interface';
import { IMessageFrontend } from 'src/messages/interface/message-frontend';

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
    if (!client.userData.user) throw new WsException("you're not authorized");
    const chats = await this.chatInterfaceService.getUserRooms(
      client.userData.user,
    );
    return client.emit('getUserRooms', chats);
  }

  @SubscribeMessage('createNewRoom')
  async createNewRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() body: CreateRoomDto,
  ): Promise<IUserRoom[]> {
    body.participantUsernames.push(client.userData.user.username);
    const result = this.chatInterfaceService.createRoom(
      client.userData,
      body.roomName,
      body.participantUsernames,
      this.server,
    );
    if (!result) throw new WsException('user was not found');

    const chats = await this.chatInterfaceService.getUserRooms(
      client.userData.user,
    );

    return client.emit<IUserRoom[]>('getUserRooms', chats);
  }

  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<IMessageFrontend> {
    const room = client.userData.room;
    await this.connectionSevice.connectToTheRoom(client.userData, room);

    const messages = await this.messageService.getAllMessages(
      client.userData,
      room,
    );
    await client.join(room._id);
    return client.emit<IMessageFrontend>('getAllMessages', messages);
  }

  @SubscribeMessage('closeRoom')
  async closeRoom(@ConnectedSocket() client: ISocketClient) {
    console.log(client.rooms);
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
