import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket, MessageBody, WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { User } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { Room, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageFrontend } from './interface/message-frontend';
import { MessageDocument } from './schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async getAllMessages(
    @ConnectedSocket() client: ISocketClient,
    roomId: string,
  ): Promise<boolean> {
    const room: RoomDocument = await this.roomModel.findById(roomId);
    const populatedRoomsParticipants: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    const isParticipant = populatedRoomsParticipants.participants.map(
      (participant: User) => {
        if (participant.username == client.userData.username) return true;
      },
    );
    if (!isParticipant.includes(true))
      throw new WsException("you're not into the room");

    const messages: MessageFrontend[] = [];
    const populatedRoomsMessages: RoomDocument = await room
      .populate('messages')
      .execPopulate();
    populatedRoomsMessages.messages.forEach((message: MessageDocument) => {
      messages.push({ username: message.username, text: message.text });
    });
    return client.emit('getAllMessages', messages);
  }

  async sendMessage(
    client: ISocketClient,
    text: string,
  ): Promise<MessageFrontend> {
    const newMessage = new this.messageModel({
      username: client.userData.username,
      text: text,
      room: client.userData.room._id,
    });

    const MessageFrontend: MessageFrontend = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await this.roomModel.findByIdAndUpdate(client.userData.room._id, {
      $addToSet: { messages: newMessage._id },
    });
    await newMessage.save();
    return MessageFrontend;
  }
}
