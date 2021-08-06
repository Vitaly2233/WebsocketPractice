import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from 'src/user/Schema/user.schema';
import { ConnectionService } from '../connection/connection.service';
import { ISocketClient } from '../common/interface/socket-client';
import { RoomDocument } from '../room/schema/room.schema';
import { IUserRoomResponse } from '../user/interface/user-rooms.interface';
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

    const activeConnected = this.connectionService.getActiveConnected();
    for (const user of users) {
      newRoom.participants.push(user._id);
      newRoom.isOnline.push({ user: user._id, status: false });
    }
    await newRoom.save();

    for (const user of users) {
      await this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: newRoom._id },
      });
      const updatedUser = await this.userModel.findById(user._id);

      const allUserRooms: IUserRoomResponse[] = await this.getUserRooms(
        updatedUser,
      );

      server
        .to(activeConnected[updatedUser._id])
        .emit('getUserRooms', allUserRooms);
    }

    return true;
  }
}
