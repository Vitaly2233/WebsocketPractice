import { HttpException, Inject, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageFrontend } from 'src/messages/interface/message-frontend';
import { MessageDocument } from 'src/messages/schema/message.schema';
import { ChatInterfaceService } from './chat-interface.service';
import { RoomDocument } from './schema/room.schema';

@WebSocketGateway()
export class ChatInterfaceGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private ChatInterfaceService: ChatInterfaceService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>, // @InjectModel('message') private messageModel: Model<MessageDocument>,
  ) {}

  @WebSocketServer() server;

  @UseGuards(TokenGuard)
  async handleConnection(client: ISocketClient) {
    return await this.ChatInterfaceService.handleConnection(client);
  }
  async handleDisconnect(client: ISocketClient) {
    // await this.ChatInterfaceService.deleteActiveConnected(client);
  }
}
