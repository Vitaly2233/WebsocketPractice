import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas/message.schema';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { SocketClientDto } from '../chatInterface/dto/socket-client.dto';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';
import { MessageToClient } from './dto/message-to-client.dto';
import { CookieParserInterceptor } from './cookie-parser.interceptor';

@WebSocketGateway()
@UseInterceptors(CookieParserInterceptor)
export class MessageGateway {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('connectToTheRoom')
  async connectToTheRoom(@ConnectedSocket() client: SocketClientDto) {
    console.log(client.userData);

    const messageIds = await this.roomModel
      .findById(client.userData.username)
      .populate('messages');

    console.log(messageIds);

    // client.emit('connectToTheRoom', messages);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: SocketClientDto,
    @MessageBody() text: string,
  ) {
    const newMessage = new this.messageModel({
      username: client.userData.username,
      text: text,
      room: client.userData.roomId,
    });

    const messageToClient: MessageToClient = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await this.roomModel.findByIdAndUpdate(client.userData.roomId, {
      $addToSet: { messages: newMessage._id },
    });
    await newMessage.save();

    this.server.to(client.userData.roomId).emit('sendMessage', messageToClient);
  }

  @SubscribeMessage('deleteAllMessages')
  async deleteAllMessages(@ConnectedSocket() client: SocketClientDto) {
    await this.messageModel.deleteMany({ room: client.userData.roomId });
    await this.roomModel.updateOne(
      { room: client.userData.roomId },
      { $set: { messages: [] } },
    );
    this.server.to(client.userData.roomId).emit('deleteAllMessages');
  }

  @SubscribeMessage('test2')
  async test2(@ConnectedSocket() client: SocketClientDto) {
    console.log('here');
  }
}
