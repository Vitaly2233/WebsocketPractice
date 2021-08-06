/* eslint-disable @typescript-eslint/ban-ts-comment */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
// import { ICreateRoomRes } from 'src/mongoose-help/interface/create-room.interface';
import { ConnectionService } from '../connection/connection.service';
import { ISocketClient } from './interface/socket-client';
import { RoomDocument } from './schema/room.schema';
import { IUserRoom } from './interface/user-rooms.interface';
import { MessageService } from 'src/messages/message.service';
import { IUserData } from './dto/user-data.dto';

type RoomName = string;

@Injectable()
export class ChatInterfaceService {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ConnectionService))
    private connectionService: ConnectionService,
    private messageService: MessageService,
  ) {}

  async getUserRooms(user: UserDocument): Promise<IUserRoom[]> {
    // return to user his chats with participant usernames and ids of this chats
    const userRoomsPopulated: UserDocument = await user
      .populate('rooms')
      .execPopulate();
    const userRooms = userRoomsPopulated.rooms;

    const sendUserRooms: Record<
      RoomName,
      { id?: ObjectId; unread?: number }
    >[] = [];
    for (const userRoom of userRooms) {
      const sendUserRoom: IUserRoom = {};
      //@ts-ignore
      sendUserRoom[userRoom.roomName] = {};
      // @ts-ignore
      sendUserRoom[userRoom.roomName].unread = await this.getUserUnread(
        user._id,
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
    userData: IUserData,
    roomName: string,
    participantUsernames: string[],
    server: ISocketClient,
  ): Promise</* ICreateRoomRes | */ boolean> {
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

    // sending to all conneccted users they're connected to the new room
    const activeConnected = this.connectionService.getActiveConnected();
    for (const user of users) {
      newRoom.participants.push(user._id);
      newRoom.isOnline.push({ user: user._id, status: false });
    }
    await newRoom.save();

    for (const user of users) {
      // this shit doesn't return updated user so I have to make additional request to get updated user
      await this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: newRoom._id },
      });
      const updatedUser = await this.userModel.findById(user._id);

      const allUserRooms: IUserRoom[] = await this.getUserRooms(updatedUser);

      server
        .to(activeConnected[updatedUser._id])
        .emit('getUserRooms', allUserRooms);
    }

    return true;
  }

  async getParticipantUsernamesOfRoom(room: RoomDocument) {
    const populatedParticipantRoom: RoomDocument = await room
      .populate('participants')
      .execPopulate();
    const usernames: string[] = [];
    for (const participant of populatedParticipantRoom.participants) {
      usernames.push(participant.username);
    }
    return usernames;
  }

  // additional functions which aren't used directly into gateway
  private async getUserUnread(
    userId: ObjectId,
    roomId: mongoose.ObjectId | string,
  ): Promise<number> {
    const user: UserDocument = await this.userModel.findById(userId);

    if (user.unread[roomId.toString()]) return user.unread[roomId.toString()];
    return 0;
  }
}
