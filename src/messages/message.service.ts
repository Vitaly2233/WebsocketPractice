import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket, WsException } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { Room, RoomDocument } from 'src/chat-interface/schema/room.schema';
import { IMessageFrontend } from './interface/message-frontend';
import { MessageDocument } from './schema/message.schema';
import { ConnectionService } from 'src/chat-interface/connection.service';
import { MongooseHelpService } from 'src/mongoose-help/mongoose-help.service';
import { ICreateRoomRes } from 'src/mongoose-help/interface/create-room.interface';

type RoomName = string;

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ConnectionService))
    private connectionService: ConnectionService,
    private mongooseHelpService: MongooseHelpService,
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
        userRoom._id,
      );
      sendUserRooms[userRoom.roomName].id = userRoom._id as ObjectId;
    });

    return sendUserRooms;
  }

  async createRoom(
    roomName: string,
    participantUsernames: string[],
    server: ISocketClient,
  ): Promise<ICreateRoomRes | boolean> {
    const activeConnected = this.connectionService.getActiveConnected();
    const newRoom = new this.roomModel({
      roomName: roomName,
      participants: [],
    });
    const users = await Promise.all(
      participantUsernames.map(async (participantUsername: string) => {
        const user: UserDocument = await this.userModel.findOne({
          username: participantUsername,
        });
        return user;
      }),
    );

    if (users.includes(undefined) || users.length === 0) return false;

    users.forEach((user: UserDocument) => {
      newRoom.participants.push(user._id);
      this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: newRoom._id },
      });
      server.to(activeConnected[user._id]).emit('getUserRooms');
    });
    await newRoom.save();
    let resultOfMethod: ICreateRoomRes = {};
    resultOfMethod = {
      status: true,
      newRoom: newRoom,
      participantDocuments: users,
    };
    return resultOfMethod;
  }

  async saveMessage(
    client: ISocketClient,
    text: string,
  ): Promise<IMessageFrontend> {
    const newMessage = new this.messageModel({
      username: client.userData.user.username,
      text: text,
      room: client.userData.room._id,
    });

    await this.roomModel.findByIdAndUpdate(client.userData.room._id, {
      $addToSet: { messages: newMessage._id },
    });

    const IMessageFrontend: IMessageFrontend = {
      text: newMessage.text,
      username: newMessage.username,
    };
    await newMessage.save();
    return IMessageFrontend;
  }

  async getUserUnread(
    userId: ObjectId,
    roomId: mongoose.ObjectId | string,
  ): Promise<number> {
    const user: UserDocument = await this.userModel.findById(userId);
    for (const message of user.unread) {
      if (message.id == roomId) return message.count;
    }
    return 0;
  }

  async getAllMessages(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<IMessageFrontend[] | WsException> {
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

    const messages: IMessageFrontend[] = [];
    populatedRoomsMessages.messages.forEach((message: MessageDocument) => {
      messages.push({ username: message.username, text: message.text });
    });
    return messages;
  }
}
