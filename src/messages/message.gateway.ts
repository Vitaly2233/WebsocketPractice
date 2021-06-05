import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schema/message.schema';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ISocketClient } from '../chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { MessageFrontend } from './interface/message-frontend';
import { CookieParserInterceptor } from './cookie-parser.interceptor';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageService } from './message.service';

@WebSocketGateway()
@UseGuards(TokenGuard)
@UseInterceptors(CookieParserInterceptor)
export class MessageGateway {
  constructor(
    private messageService: MessageService,
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  @WebSocketServer() server: ISocketClient;

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() text: string,
  ) {
    const newMessage = new this.messageModel({
      username: client.userData.username,
      text: text,
      room: client.userData.roomId,
    });

    const MessageFrontend: MessageFrontend = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await this.roomModel.findByIdAndUpdate(client.userData.roomId, {
      $addToSet: { messages: newMessage._id },
    });
    await newMessage.save();

    this.server.to(client.userData.roomId).emit('sendMessage', MessageFrontend);
  }

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(@ConnectedSocket() client: ISocketClient) {
    await this.messageModel.deleteMany({ room: client.userData.roomId });
    await this.roomModel.updateOne(
      { room: client.userData.roomId },
      { $set: { messages: [] } },
    );
    this.server.to(client.userData.roomId).emit('deleteAllMessages');
  }

  @SubscribeMessage('test2')
  async test(client) {
    this.messageService.getAllMessages(client, 'sdf');
  }
}
