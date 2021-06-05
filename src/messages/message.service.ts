import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { Room, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { TokenGuard } from 'src/guards/token.guard';
import { MessageFrontend } from './interface/message-frontend';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async getAllMessages(
    client: ISocketClient,
    roomId: string,
  ): Promise<boolean> {
    const room: RoomDocument = await this.roomModel.findById(roomId);
    const populatedRoom: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    populatedRoom.participants.forEach((e: User) => {
      if (e.username != client.userData.roomId)
        return client.emit('newError', {
          message: "you're not into the room",
        });
    });

    const messages: MessageFrontend[] = [];
    populatedRoom.messages.forEach((e: MessageDocument) => {
      messages.push({ username: e.username, text: e.text });
    });

    return client.emit('getAllMessages', messages);
  }
}
