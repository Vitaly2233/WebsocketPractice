import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket, WsException } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { IMessageFrontend } from './interface/message-frontend';
import { MessageDocument } from './schema/message.schema';
import { isOnline, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { IUserData } from 'src/chat-interface/dto/user-data.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ConnectionService))
    private connectionService: ConnectionService,
  ) {}

  async saveMessage(
    userData: IUserData,
    text: string,
  ): Promise<IMessageFrontend> {
    const newMessage = new this.messageModel({
      username: userData.user.username.toString(),
      text: text,
      room: userData.room._id,
    });

    await newMessage.save();

    await this.roomModel.findByIdAndUpdate(userData.room._id, {
      $addToSet: { messages: newMessage._id },
    });

    const IMessageFrontend: IMessageFrontend = {
      text: newMessage.text,
      username: newMessage.username,
    };

    return IMessageFrontend;
  }

  async getAllMessages(
    userData: IUserData,
    room: RoomDocument,
  ): Promise<IMessageFrontend[] | WsException> {
    const populatedRoomsParticipants: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    const isParticipant = populatedRoomsParticipants.participants.map(
      (participant: User) => {
        if (participant.username == userData.user.username) return true;
      },
    );
    if (!isParticipant.includes(true))
      throw new WsException("you're not into the room");
    const populatedRoomsMessages: RoomDocument = await room
      .populate('messages')
      .execPopulate();

    const messages: IMessageFrontend[] = [];
    populatedRoomsMessages.messages.forEach((message: MessageDocument) => {
      messages.push({ username: message.username, text: message.text });
    });
    return messages;
  }

  async sendMessageToRoom(
    client: ISocketClient,
    server: ISocketClient,
    activeConnected,
    message: IMessageFrontend,
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
        await this.userModel.findByIdAndUpdate(participant.user, {
          $inc: { ['unread.' + client.userData.room._id]: 1 },
        });
        const userModel: UserDocument = await this.userModel.findById(
          participant.user,
        );
      }
      server
        .to(activeConnected[participant.user.toString()])
        .emit('newMessage', message);
    }
  }
}
