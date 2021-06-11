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
import { isOnline, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { TokenGuard } from 'src/guard/token.guard';
import { MessageService } from './message.service';
import { SetCurrentRoomInterceptor } from '../interceptor/set-current-room.interceptor';
import { ExceptionInterceptor } from '../interceptor/exception.interceptor';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { IMessageFrontend } from './interface/message-frontend';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { MongooseHelpService } from 'src/mongoose-help/mongoose-help.service';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(SetCurrentRoomInterceptor, ExceptionInterceptor)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    private connetionService: ConnectionService,
    @InjectModel('user') private userModel: Model<UserDocument>,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(@ConnectedSocket() client: ISocketClient) {
    return this.messageService.getAllMessages(client);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const messageFronted: IMessageFrontend =
      await this.messageService.saveMessage(client, text);

    const roomPopulatedOnline = await client.userData.room
      .populate('online')
      .execPopulate();

    const activeConnected = this.connetionService.getActiveConnected();
    roomPopulatedOnline.isOnline.forEach(async (isOnline: isOnline) => {
      if (isOnline.status) {
        this.server
          .to(activeConnected[isOnline.user as string])
          .emit('newMessage', messageFronted);
      } else {
        await this.userModel.findByIdAndUpdate(isOnline.user, {
          $inc: { ['unread.$.' + client.userData.room._id]: 1 },
        });
      }
    });
  }

  @SubscribeMessage('test2')
  async test(client) {
    throw new WsException('somemessage');
  }
}
