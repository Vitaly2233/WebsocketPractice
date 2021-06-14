/* eslint-disable @typescript-eslint/ban-ts-comment */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ICreateRoomRes } from 'src/mongoose-help/interface/create-room.interface';
import { ConnectionService } from './connection.service';
import { ISocketClient } from './interface/socket-client';
import { Room, RoomDocument } from './schema/room.schema';
import { IUserRoom } from './interface/user-rooms.interface';

type RoomName = string;

@Injectable()
export class ChatInterfaceService {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ConnectionService))
    private connectionService: ConnectionService,
  ) {}

  async getUserRooms(
    @ConnectedSocket() client: ISocketClient,
  ): Promise<IUserRoom[]> {
    const username: string = client.userData.user.username;
    // return to user his chats with participant usernames and ids of this chats
    const userRoomsPopulated: UserDocument = await (
      await this.userModel.findOne({ username: username }).populate('rooms')
    ).execPopulate();

    const userRooms = userRoomsPopulated.rooms;

    const sendUserRooms: Record<
      RoomName,
      { id?: ObjectId; unread?: number }
    >[] = [];
    for (const userRoom of userRooms) {
      // @ts-ignore
      const sendUserRoom: IUserRoom = {};
      // @ts-ignore
      sendUserRoom[userRoom.roomName] = {};

      // @ts-ignore
      sendUserRoom[userRoom.roomName].unread = await this.getUserUnread(
        client.userData.user._id,
        // @ts-ignore
        userRoom._id,
      );
      // @ts-ignore
      sendUserRoom[userRoom.roomName].id = userRoom._id as ObjectId;

      sendUserRooms.push(sendUserRoom);
    }

    return sendUserRooms;
  }

  async createRoom(
    roomName: string,
    participantUsernames: string[],
    server: ISocketClient,
  ): Promise<ICreateRoomRes | boolean> {
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

    const activeConnected = this.connectionService.getActiveConnected();
    users.forEach(async (user: UserDocument) => {
      newRoom.participants.push(user._id);
      await this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: newRoom._id },
      });
      server.to(activeConnected[user._id]).emit('getAllRooms');
    });
    newRoom.save();

    let resultOfMethod: ICreateRoomRes = {};
    resultOfMethod = {
      status: true,
      newRoom: newRoom,
      participantDocuments: users,
    };
    return resultOfMethod;
  }

  // additional functions which aren't used directly into gateway
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
}
