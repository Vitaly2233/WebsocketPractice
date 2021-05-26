import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas/message.schema';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway()
export class ChatGateway {
  constructor(@InjectModel('ms') private messageCon: Model<MessageDocument>) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload): void {
    new this.messageCon({
      name: payload.name,
      text: payload.text,
      date: Date.now(),
    }).save();

    this.server.emit('sendMesssageToAll', payload);
  }

  @SubscribeMessage('getAllMessages')
  async getAllMessages(@ConnectedSocket() client) {
    const messages: MessageDto[] = await this.messageCon.find({});

    client.broadcast.emit('test');

    client.emit('getAllMessages', messages);
  }

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(@ConnectedSocket() client) {
    await this.messageCon.deleteMany({});

    client.broadcast.emit('deleteAllMessages');
  }
}
