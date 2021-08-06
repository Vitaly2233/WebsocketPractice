import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ISocketClient } from 'src/common/interface/socket-client';
import { MessageService } from 'src/messages/message.service';
import { ChatInterfaceService } from './chat-interface.service';
import { ConnectionService } from '../connection/connection.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IUserRoomResponse } from '../user/interface/user-rooms.interface';
import { IMessageFrontend } from 'src/messages/interface/message-frontend';
import { CurrentRoomGuard } from 'src/common/guard/current-room.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@WebSocketGateway()
@UseGuards(JwtAuthGuard)
export class ChatInterfaceGateWay {
  constructor(
    private connectionSevice: ConnectionService,
    private chatInterfaceService: ChatInterfaceService,
    private messageService: MessageService,
  ) {}

  @WebSocketServer() server;

  @SubscribeMessage('getUserRooms')
  async getUserRooms(@ConnectedSocket() client: ISocketClient) {
    if (!client.userData.user)
      throw new WsException('user in gettin user chats is not found');
    const chats = await this.chatInterfaceService.getUserRooms(
      client.userData.user,
    );
    return client.emit('getUserRooms', chats);
  }

  @SubscribeMessage('createNewRoom')
  async createNewRoom(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() body: CreateRoomDto,
  ): Promise<IUserRoomResponse[]> {
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

    return client.emit<IUserRoomResponse[]>('getUserRooms', chats);
  }

  @UseGuards(CurrentRoomGuard)
  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: ISocketClient) {
    const room = client.userData.room;
    await this.connectionSevice.connectToTheRoom(client.userData, room);
    const messages = await this.messageService.getAllMessages(
      client.userData,
      room,
    );
    const participants =
      await this.chatInterfaceService.getParticipantUsernamesOfRoom(
        client.userData.room,
      );
    client.emit('getParticipants', participants);

    await client.join(room._id.toString(), () => {
      console.log('client rooms after adding', client.rooms);
    });

    return client.emit<IMessageFrontend>('getAllMessages', messages);
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    return client.emit<string>('getUsername', client.userData.user.username);
  }
}
