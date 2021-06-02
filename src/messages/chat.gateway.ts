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

interface MessageToClient {
  username: string;
  text: string;
}

@WebSocketGateway()
@UseGuards(MessageGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel('ms') private messageModel: Model<MessageDocument>,
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
    const messages = await this.messageModel.find({ room: chatId });
    let messagesToClient: Array<MessageToClient> = [];
    for (const message of messages) {
      messagesToClient.push({ text: message.text, username: message.username });
    }
    const data = {
      participants: participants,
      messagesInRoom: messagesToClient,
    };

    client.emit('getData', data);
  }

  async handleDisconnect(client: Socket) {
    await this.activeConnectedService.deleteActiveConnected(client);
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: SocketClientDto,
    @MessageBody() text: string,
  ) {
    const newMessage = new this.messageModel({
      username: client.userData.username,
      text: text,
      room: client.userData.chatId,
    });

    const messageToClient: MessageToClient = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await this.roomModel.findByIdAndUpdate(client.userData.chatId, {
      $addToSet: { messages: newMessage._id },
    });
    await newMessage.save();

    this.server.to(client.userData.chatId).emit('sendMessage', messageToClient);
  }
}
