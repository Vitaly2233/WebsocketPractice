import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Types, Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { ISocketClient } from 'src/common/interface/socket-client';
import { Room, RoomDocument } from 'src/room/schema/room.schema';
import { ConnectionService } from 'src/connection/connection.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/messages/message.service';

@Injectable()
export class RoomService {
  constructor(
    private userService: UserService,
    private messageService: MessageService,
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

    let userIds: string[] = [];
    for (const username of participantUsernames) {
      const user: UserDocument = await this.userService.findOneByUsername(
        username,
      );
      if (!user) throw new WsException(`user ${username} is missing`);
      newRoom.participants.push(user._id);
      newRoom.isOnline.push({ user: user._id, status: false });
      userIds.push(user._id);
    }

    const activeConnected = this.connectionService.getActiveConnected();
    await newRoom.save();

    await this.userService.updateByIds(userIds, {
      $push: { rooms: newRoom._id },
    });

    for (const id of userIds) {
      const allUserRooms: Room[] = await this.userService.getUserRooms(id);

      server.to(activeConnected[id]).emit('getUserRooms', allUserRooms);
    }

    return true;
  }

  async findById(_id: string) {
    return await this.roomModel.findById(_id);
  }

  async connectToTheRoom(
    user: UserDocument,
    room: RoomDocument,
    client: ISocketClient,
  ) {
    await this.userService.removeUnreads(user, room._id);
    await this.changeUserStatus(user._id, room, true);

    const messages = await this.messageService.getAllMessages(
      user.username,
      room,
    );
    const participants = await this.getParticipantUsernames(
      client.userData.room,
    );
    client.emit('getParticipants', participants);

    await client.join(room._id.toString(), () => {
      console.log('client rooms after adding', client.rooms);
    });

    return client.emit('getAllMessages', messages);
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

  async changeUserStatus(
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
