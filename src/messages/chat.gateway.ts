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
import { UseGuards } from '@nestjs/common';
import { MessageGuard } from './message.guard';
import { GuardConnections } from './active-connected.service';
import { SocketClientDto } from './dto/socket-client.dto';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';
import { MessageToClient } from './dto/message-to-client.dto';

@WebSocketGateway()
@UseGuards(MessageGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectModel('ms') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private activeConnectedService: GuardConnections,
  ) {}

  async handleConnection(client: SocketClientDto) {
    // using guards for implementation?
    const { chatId, participants } =
      await this.activeConnectedService.guardForNewConnected(client);

    await client.join(chatId);
    delete client.rooms[client.id];
    const messages = await this.messageModel.find({ room: chatId });
    // eslint-disable-next-line prefer-const
    let messagesToClient: MessageToClient[] = [];
    for (const message of messages) {
      messagesToClient.push({ text: message.text, username: message.username });
    }
    const data = {
      participants: participants,
      messagesInRoom: messagesToClient,
    };

    client.emit('getData', data);
    console.log('user ', client.id, ' is connected');
  }

  async handleDisconnect(client: SocketClientDto) {
    await this.activeConnectedService.deleteActiveConnected(client);
    console.log('user ', client.id, ' is disconected');
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

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(
    @ConnectedSocket() client: SocketClientDto,
    @MessageBody() text: string,
  ) {
    await this.messageModel.deleteMany({ room: client.userData.chatId });
    await this.roomModel.updateOne(
      { room: client.userData.chatId },
      { $set: { messages: [] } },
    );
    this.server.to(client.userData.chatId).emit('deleteAllMessages');
  }
}
