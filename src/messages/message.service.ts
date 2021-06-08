import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket, WsException } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { Room, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { MessageFrontend } from './interface/message-frontend';
import { MessageDocument } from './schema/message.schema';

type RoomName = string;

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
  ) {}

  async getUserRooms(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<Record<RoomName, { id: ObjectId; unread: number }>> {
    const username: string = client.userData.user.username;
    // return to user his chats with participant usernames and ids of this chats
    const sendUserRooms: Record<RoomName, { id: ObjectId; unread: number }> =
      {};
    const userRoomsPopulated: UserDocument = await (
      await this.userModel.findOne({ username: username }).populate('rooms')
    ).execPopulate();
    const userRooms = userRoomsPopulated.rooms;
    userRooms.forEach(async (userRoom: Room) => {
      sendUserRooms[userRoom.roomName].unread = await this.getUserUnread(
        client.userData.user._id,
      );
      sendUserRooms[userRoom.roomName].id = userRoom._id;
    });

    return sendUserRooms;
  }

  async getUserUnread(userId: ObjectId): Promise<number> {
    const user: UserDocument = await this.userModel.findById(userId);
    return user.unread;
  }

  async getAllMessages(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<boolean> {
    const room: RoomDocument = client.userData.room;
    const populatedRoomsParticipants: RoomDocument = await room
      .populate('participants')
      .execPopulate();

    const isParticipant = populatedRoomsParticipants.participants.map(
      (participant: User) => {
        if (participant.username == client.userData.user.username) return true;
      },
    );
    if (!isParticipant.includes(true))
      throw new WsException("you're not into the room");
    const populatedRoomsMessages: RoomDocument = await room
      .populate('messages')
      .execPopulate();

    const messages: MessageFrontend[] = [];
    populatedRoomsMessages.messages.forEach((message: MessageDocument) => {
      messages.push({ username: message.username, text: message.text });
    });
    return client.emit('getAllMessages', messages);
  }

  async saveMessage(
    client: ISocketClient,
    text: string,
  ): Promise<MessageFrontend> {
    const newMessage = new this.messageModel({
      username: client.userData.user.username,
      text: text,
      room: client.userData.room._id,
    });

    await this.roomModel.findByIdAndUpdate(client.userData.room._id, {
      $addToSet: { messages: newMessage._id },
    });

    const MessageFrontend: MessageFrontend = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await newMessage.save();
    return MessageFrontend;
  }

  async getNewUserUnread(client: ISocketClient, username: string) {
    const user: UserDocument = client.userData.user;
  }
}
