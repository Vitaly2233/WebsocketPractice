import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { IMessageResponse } from './interface/message-response';
import { Message, MessageDocument } from './schema/message.schema';
import { RoomDocument } from 'src/room/schema/room.schema';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { ConnectionService } from 'src/connection/connection.service';
import { ServerService } from 'src/server/server.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    private roomService: RoomService,
    private connectionService: ConnectionService,
    private serverService: ServerService,
    private userService: UserService,
  ) {}

  async create(
    senderUsername: string,
    roomId: string | Types._ObjectId,
    messageText: string,
  ) {
    const newMessage = new this.messageModel({
      username: senderUsername,
      messageText,
      room: roomId,
    });
    await newMessage.save();
    await this.roomService.updateOne(
      { _id: roomId },
      {
        $addToSet: { messages: newMessage._id },
      },
    );
    return newMessage;
  }

  async getAllInRoom(username: string, room: RoomDocument) {
    const populatedRoom: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    const isParticipant = this.roomService.isParticipant(username, populatedRoom.participants as User[])

    if (!isParticipant)
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

  async sendToRoom(
    senderUsername: string,
    roomName: string,
    roomId: Types._ObjectId,
    roomParticipants: Types._ObjectId[],
    messageText: string,
  ) {
    const message = await this.create(senderUsername, roomId, messageText);

    await this.userService.updateByIds(roomParticipants, {
      $inc: { ['unread.' + roomId]: 1 },
    });

    this.serverService.sendMessageToRoom(roomName, message);
  }
}
