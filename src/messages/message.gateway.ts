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
import { TokenGuard } from 'src/messages/message.token.guard';
import { MessageService } from './message.service';
import { CookieParserInterceptor } from './interceptor/cookie-parser.interceptor';
import { ExceptionInterceptor } from './interceptor/exception.interceptor';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { MessageFrontend } from './interface/message-frontend';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
// import { IActiveConnected } from 'src/chat-interface/interface/active-connected.interface';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(CookieParserInterceptor, ExceptionInterceptor)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    private connetionService: ConnectionService,
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(@ConnectedSocket() client: ISocketClient) {
    console.log('get all messages is called');

    return this.messageService.getAllMessages(client);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const messageFronted: MessageFrontend =
      await this.messageService.saveMessage(client, text);

    const roomPopulatedOffline = await client.userData.room
      .populate('offline')
      .execPopulate();
    const roomPopulatedOnline = await client.userData.room
      .populate('online')
      .execPopulate();

    roomPopulatedOffline.offline.forEach(async (offlineUSer: User) => {
      try {
        await this.userModel.findByIdAndUpdate(offlineUSer._id, {
          $inc: { ['unread.$.' + client.userData.room._id]: 1 },
        });
      } catch (e) {
        return;
      }
    });

    //IActiveConnected
    const activeConnected = this.connetionService.getActiveConnected();
    roomPopulatedOnline.online.forEach(async (onlineUser: User) => {
      this.server
        .to(activeConnected[onlineUser._id as string])
        .emit('newMessage', messageFronted);
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
