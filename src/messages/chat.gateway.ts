import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
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
import { SocketClientDto } from './dto/socket-client.dto';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';

@WebSocketGateway()
@UseGuards(MessageGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel('ms') private messages: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private activeConnectedService: ActiveConnectedService,
  ) {}

  async handleConnection(client: SocketClientDto) {
    // using guards for implementation?
    const { chatId, clientId, participants } =
      await this.activeConnectedService.guardForNewConnected(client);

    this.activeConnectedService.addActiveConnected(clientId, chatId);
    await client.join(chatId);
    delete client.rooms[client.id];
    const messages = this.roomModel.find();
    const data = {
      participants: participants,
      messagesInRoom: this.roomModel,
    };

    client.emit('getData', data);
  }

  async handleDisconnect(client: Socket) {
    await this.activeConnectedService.deleteActiveConnected(client);
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async sendMessage(@ConnectedSocket() client: SocketClientDto) {
    console.log(client.userData);
    const messages: MessageDto[] = await this.messages.find({});
  }
}
