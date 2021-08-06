import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Types, Model } from 'mongoose';
import { User, UserDocument } from 'src/user/Schema/user.schema';
import { ISocketClient } from 'src/common/interface/socket-client';
import { IUserRoomResponse } from 'src/user/interface/user-rooms.interface';
import { RoomDocument } from 'src/room/schema/room.schema';
import { ConnectionService } from 'src/connection/connection.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoomService {
  constructor(
    private userService: UserService,
    private connectionService: ConnectionService,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async createRoom(
    roomName: string,
    participantUsernames: string[],
    server: ISocketClient,
  ) {
    const newRoom = new this.roomModel({
      roomName: roomName,
      participants: [],
    });

    let users: UserDocument[] = [];
    for (const username of participantUsernames) {
      const user: UserDocument = await this.userService.findOneByUsername(
        username,
      );
      if (!user) throw new WsException(`user ${username} is missing`);
      newRoom.participants.push(user._id);
      newRoom.isOnline.push({ user: user._id, status: false });
      users.push(user);
    }

    const activeConnected = this.connectionService.getActiveConnected();
    await newRoom.save();

    for (const user of users) {
      await this.userService.updateUser(user._id, {
        $push: { rooms: newRoom._id },
      });
      const updatedUser = await this.userService.findById(user._id);

      const allUserRooms: IUserRoomResponse[] =
        await this.userService.getUserRooms(updatedUser._id);

      server
        .to(activeConnected[updatedUser._id])
        .emit('getUserRooms', allUserRooms);
    }

    return true;
  }

  async findById(_id: string) {
    return await this.roomModel.findById(_id);
  }

  async connectToTheRoom(user: UserDocument, room: RoomDocument) {
    await this.userService.removeUnreads(user, room._id);
    await this.changeUserStatus(user._id, room, true);
  }

  async closeRoom(
    client: ISocketClient,
    userId: string | Types._ObjectId,
    currentRoomId: string | Types._ObjectId,
  ) {
    await this.changeUserStatus(userId, client.userData.room, false);
    return await client.leave(currentRoomId.toString(), () => {
      client.emit('closeRoom');
    });
  }

  async getParticipantUsernames(room: RoomDocument) {
    const populdatedRoom: RoomDocument = await room
      .populate('participants')
      .execPopulate();
    const usernames: string[] = [];
    for (const participant of populdatedRoom.participants) {
      if (participant instanceof User) usernames.push(participant.username);
    }
    return usernames;
  }

  private async changeUserStatus(
    userId: string | Types._ObjectId,
    room: RoomDocument,
    status: boolean,
  ) {
    if (!room) return false;
    let index = 0;
    for (const participant of room.isOnline) {
      if (participant.user.toString() == userId.toString()) {
        room.isOnline[index].status = status;
        room.markModified('isOnline');

        await room.save();
        return true;
      }
      index++;
    }
    return false;
  }
}
