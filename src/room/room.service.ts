import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Types, Model, UpdateQuery, FilterQuery } from 'mongoose';
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
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @Inject(forwardRef(() => ConnectionService))
    private connectionService: ConnectionService,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async create(
    roomName: string,
    participantUsernames: string[],
    server: ISocketClient,
  ) {
    const newRoom = new this.roomModel({
      roomName: roomName,
      participants: [],
    });

    let userIds: Types._ObjectId[] = [];
    for (const username of participantUsernames) {
      const user: UserDocument = await this.userService.findOneByUsername(
        username,
      );
      if (!user) throw new WsException(`user ${username} is missing`);
      newRoom.participants.push(user._id);
      newRoom.online.push(user._id);
      userIds.push(user._id);
    }

    const activeConnected = this.connectionService.getActiveConnected();
    await newRoom.save();

    await this.userService.updateByIds(userIds, {
      $push: { rooms: newRoom._id },
    });

    for (const id of userIds) {
      const allUserRooms: Room[] = await this.userService.getUserRooms(id);

      server.to(activeConnected[id.toString()]).emit('getUserRooms', allUserRooms);
    }

    return true;
  }

  async findById(_id: string) {
    return await this.roomModel.findById(_id);
  }

  async updateOne(
    filter?: FilterQuery<RoomDocument>,
    update?: UpdateQuery<RoomDocument>,
  ) {
    this.roomModel.updateOne(filter, update);
  }

  async connect(user: UserDocument, room: RoomDocument, client: ISocketClient) {
    await this.userService.removeUnreads(user, room._id);
    await this.changeUserStatus(user._id, room, true);

    const messages = await this.messageService.getAllInRoom(
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

  async close(
    client: ISocketClient,
    userId: string | Types._ObjectId,
    currentRoomId: string | Types._ObjectId,
  ) {
    await this.changeUserStatus(userId, client.userData.room, false);
    return await client.leave(currentRoomId.toString(), () => {
      client.emit('closeRoom');
    });
  }

  getActiveUsersInRoom(room: Room | Types._ObjectId) {
    if (room instanceof Room) return this.roomModel.find({});
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

  isParticipant(username: string, participants: User[]){
    participants.map((participant) => {
      if (participant.username === username) return true;
    })
    return false; 
  }

  private async changeUserStatus(
    userId: string | Types._ObjectId,
    room: RoomDocument,
    status: boolean,
  ) {
    if (status)
      return await this.roomModel.updateOne(room._id, {
        $pull: { online: { userId } },
      });
    return await this.roomModel.updateOne(room._id, {
      $push: { online: { userId } },
    });
  }
}
