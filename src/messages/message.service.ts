import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { ISocketClient } from 'src/common/interface/socket-client';
import { IMessageResponse } from './interface/message-frontend';
import { Message, MessageDocument } from './schema/message.schema';
import { RoomDocument } from 'src/room/schema/room.schema';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    private roomService: RoomService,
    private userService: UserService,
  ) {}

  async saveMessage(
    username: string,
    roomId: string | Types._ObjectId,
    text: string,
  ): Promise<IMessageResponse> {
    const newMessage = new this.messageModel({
      username,
      text,
      room: roomId,
    });
    await newMessage.save();
    await this.roomService.updateOne(
      { _id: roomId },
      {
        $addToSet: { messages: newMessage._id },
      },
    );
    const IMessageResponse: IMessageResponse = {
      text: newMessage.text,
      username: newMessage.username,
    };
    return IMessageResponse;
  }

  async getAllMessages(username: string, room: RoomDocument) {
    const populatedRoom: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    const isParticipant = populatedRoom.participants.map(
      (participant: User | Types._ObjectId) => {
        if (participant instanceof User)
          if (participant.username === username) return true;
      },
    );
    if (!isParticipant.includes(true))
      throw new WsException("you're not into the room");
    const messages = (await room.populate('messages').execPopulate()).messages;

    const messagesResponse: IMessageResponse[] = [];
    messages.forEach((message: Message | Types._ObjectId) => {
      if (message instanceof Message)
        messagesResponse.push({
          username: message.username,
          text: message.text,
        });
    });
    return messages as Message[];
  }

  async sendMessageToRoom(
    client: ISocketClient,
    server: ISocketClient,
    activeConnected,
    message: IMessageResponse,
  ) {
    for (const participant of client.userData.room.isOnline) {
      console.log(
        'connected user:',
        activeConnected[participant.user.toString()],
      );
      if (
        !activeConnected[participant.user.toString()] ||
        !participant.status
      ) {
        await this.userService.updateOne(participant.user._id, {
          $inc: { ['unread.' + client.userData.room._id]: 1 },
        });
      }
      server
        .to(activeConnected[participant.user.toString()])
        .emit('newMessage', message);
    }
  }
}
