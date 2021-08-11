import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { ISocketClient } from 'src/common/interface/socket-client';
import { IMessageResponse } from './interface/message-response';
import { Message, MessageDocument } from './schema/message.schema';
import { Room, RoomDocument } from 'src/room/schema/room.schema';
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

  async sendToRoom(senderUsername: string, room: Room, messageText: string) {
    const message = await this.create(senderUsername, room._id, messageText);

    if (room.participants instanceof Array)
      room.participants.filter((participant) => {});

    for (const participant of room.participants) {
      const userId = participant.user._id.toString();
      // if (!participant.status) {
      //   await this.userService.updateOne(userId, {
      //     $inc: { ['unread.' + room._id]: 1 },
      //   });
      // }
      this.serverService.sendMessageToRoom(room.name, message);
    }
  }
}
