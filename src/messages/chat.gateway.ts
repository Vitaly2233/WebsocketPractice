import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas/message.schema';
import { MessageDto } from './dto/message.dto';
import { UseGuards } from '@nestjs/common';
import { UserDocument } from 'src/auth/dto/user.schema';
import { MessageGuard } from './message.guard';
import { ActiveConnectedService } from './active-connected.service';
// import { RoomDocument } from './schemas/rooms.schema';
// import { ActiveConnectionsService } from './active-connections.service';

@WebSocketGateway()
@UseGuards(MessageGuard)
export class ChatGateway implements OnGatewayConnection {
  constructor(
    @InjectModel('ms') private messages: Model<MessageDocument>,
    private activeConnectedService: ActiveConnectedService,
  ) {}

  async handleConnection(client: any, ...args: any[]) {
    const cookie = client.handshake?.headers?.cookie;
    if (!cookie) throw new WsException('cookies are missing');
    this.activeConnectedService.addActiveConnected(client.id, cookie);
    client.join();
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload): void {
    new this.messages({
      name: payload.name,
      text: payload.text,
      date: Date.now(),
    }).save();
    this.server.emit('msgToServer', payload);
  }

  @SubscribeMessage('getAllMessages')
  async getAllMessages(@ConnectedSocket() client) {
    const messages: MessageDto[] = await this.messages.find({});
    client.emit('getAllMessages', messages);
  }

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(@ConnectedSocket() client) {
    await this.messages.deleteMany({});
    this.server.emit('deleteAllMessages');
  }
}
