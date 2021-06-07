import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schema/message.schema';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ISocketClient } from '../chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageService } from './message.service';
import { CookieParserInterceptor } from './interceptor/cookie-parser.interceptor';
import { ExceptionInterceptor } from './interceptor/exception.interceptor';
import { IActiveConnected } from 'src/chat-interface/interface/active-connected.interface';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { MessageFrontend } from './interface/message-frontend';
import { User } from 'src/auth/Schema/user.schema';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(CookieParserInterceptor, ExceptionInterceptor)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    private connetionService: ConnectionService,
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(@ConnectedSocket() client: ISocketClient) {
    const roomId = client.userData.room._id;
    return this.messageService.getAllMessages(client, roomId);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const messageFronted: MessageFrontend =
      await this.messageService.sendMessage(client, text);

    const roomPopulatedOnline = await client.userData.room
      .populate('online')
      .execPopulate();
    roomPopulatedOnline.online.forEach((onlineUser: User) => {
      const userSocketId = getKeyByValue(onlineUser, onlineUser._id);
      if (!userSocketId) return;
      this.server.to(userSocketId).emit('getNewMessage', messageFronted);
    });
  }

  @SubscribeMessage('test2')
  async test(client) {
    throw new WsException('somemessage');
    // AAAAAAAAAAAAAAAAAAA FUCKING RETURN
    // return this.messageService.getAllMessages(client, 'sdf');
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object)?.find((key) => object[key] === value);
}
