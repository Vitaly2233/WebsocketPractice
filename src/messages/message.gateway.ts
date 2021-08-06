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
// import { TokenGuard } from 'src/auth/guard/jwt.guard';
import { MessageService } from './message.service';
import { ExceptionInterceptor } from '../interceptor/exception.interceptor';
import { ConnectionService } from 'src/connection/connection.service';
import { IMessageFrontend } from './interface/message-frontend';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { CurrentRoomGuard } from 'src/guard/current-room.guard';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { MessageDocument } from './schema/message.schema';

@WebSocketGateway()
@UseGuards(CurrentRoomGuard)
@UseInterceptors(ExceptionInterceptor)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    private connetionService: ConnectionService,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('getAllMessagesInRoom')
  async getAllMessagesInRoom(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<IMessageFrontend | WsException> {
    const room = client.userData.room;
    const messages = await this.messageService.getAllMessages(
      client.userData,
      room,
    );

    return client.emit<IMessageFrontend>('getAllMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const messageFronted: IMessageFrontend =
      await this.messageService.saveMessage(client.userData, text);
    const activeConnected = this.connetionService.getActiveConnected();
    await this.messageService.sendMessageToRoom(
      client,
      this.server,
      activeConnected,
      messageFronted,
    );
  }
}
