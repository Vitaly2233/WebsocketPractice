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
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ISocketClient } from '../chat-interface/interface/socket-client';
import { TokenGuard } from 'src/guard/token.guard';
import { MessageService } from './message.service';
import { SetCurrentRoomInterceptor } from '../interceptor/set-current-room.interceptor';
import { ExceptionInterceptor } from '../interceptor/exception.interceptor';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { IMessageFrontend } from './interface/message-frontend';
import { UserDocument } from 'src/auth/Schema/user.schema';

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
    const room = client.userData.room;
    return this.messageService.getAllMessages(client, room);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const messageFronted: IMessageFrontend =
      await this.messageService.saveMessage(client, text);

    const activeConnected = this.connetionService.getActiveConnected();

    await this.messageService.sendMessageToActiveConnected(
      client,
      this.server,
      activeConnected,
      messageFronted,
    );
  }

  @SubscribeMessage('test2')
  async test(client) {
    throw new WsException('somemessage');
  }
}
