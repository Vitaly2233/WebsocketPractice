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
import { ExceptionInterceptor } from 'src/interceptor/exception.interceptor';
import { MessageService } from 'src/messages/message.service';
import { TokenGuard } from 'src/guard/token.guard';
import { ChatInterfaceService } from './chat-interface.service';
import { ConnectionService } from './connection.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IUserRoom } from './interface/user-rooms.interface';
import { IMessageFrontend } from 'src/messages/interface/message-frontend';
import { CurrentRoomGuard } from 'src/guard/current-room.guard';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from './schema/room.schema';
import { Model } from 'mongoose';
import { MessageDocument } from 'src/messages/schema/message.schema';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(ExceptionInterceptor)
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private connectionSevice: ConnectionService,
    private chatInterfaceService: ChatInterfaceService,
    private messageService: MessageService,

    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('message') private messageModel: Model<MessageDocument>,
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

  @UseGuards(CurrentRoomGuard)
  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(
    @ConnectedSocket() client: ISocketClient,
  ) /* : Promise<IMessageFrontend> */ {
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
    await client.join(room._id);

    return client.emit<IMessageFrontend>('getAllMessages', messages);
  }

  @SubscribeMessage('closeRoom')
  async closeRoom(@ConnectedSocket() client: ISocketClient) {
    console.log('closing a room');
  }

  @SubscribeMessage('getUsername')
  getUsername(@ConnectedSocket() client: ISocketClient): string {
    console.log('get username is called');

    return client.emit<string>('getUsername', client.userData.user.username);
  }

  async deleteServerData() {
    await this.userModel.deleteMany({});
    await this.roomModel.deleteMany({});
    await this.messageModel.deleteMany({});
  }
}
