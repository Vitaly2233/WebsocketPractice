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
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ISocketClient } from '../chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageService } from './message.service';
import { CookieParserInterceptor } from '../auth/interceptor/cookie-parser.interceptor';
import { OtherInterceptor } from './other.interceptor';

@WebSocketGateway()
@UseInterceptors(CookieParserInterceptor, OtherInterceptor)
@UseGuards(TokenGuard)
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
    // const messagesFronted: MessageFrontend[] =
    //   await this.messageService.sendMessage(client, text);
    // const activeConnected = this.connectionService.getActiveConnected();
    // this.server.to();
  }

  @SubscribeMessage('test2')
  async test(client) {
    // AAAAAAAAAAAAAAAAAAA FUCKING RETURN
    // return this.messageService.getAllMessages(client, 'sdf');
  }
}
