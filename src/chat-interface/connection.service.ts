import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Schema } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageService } from 'src/messages/message.service';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from '../auth/dto/token-data';
import { RoomDocument } from './schema/room.schema';
import { IUserData } from './dto/user-data.dto';

@Injectable()
export class ConnectionService {
  private activeConnected = {};

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => MessageService))
    private messageSrvice: MessageService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  getActiveConnected() {
    return this.activeConnected;
  }

  async handleConnection(client: ISocketClient) {
    // check the valid of user data cookies etc...
    const cookie: string | undefined = client?.handshake?.headers?.cookie;
    if (!cookie) {
      client.emit('newError', { message: 'cookie is missing' });
      return client.disconnect();
    }
    const token: string | undefined = getCookieValueByName(cookie, 'token');

    let verifiedData: ITokenData;
    // validating a token
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {}
    if (!verifiedData) {
      client.emit('newError', { message: 'token is not provided' });
      return client.disconnect();
    }
    if (!verifiedData) {
      console.log('49');

      client.emit('newError', { message: "you're not authorized" });
      return client.disconnect();
    }

    const { username } = verifiedData;
    if (!username) {
      client.emit('newError', { message: 'cookie is missing' });
      return client.disconnect();
    }

    const user: UserDocument = await this.userModel.findOne({
      username: username,
    });

    if (!user) {
      console.log('74');

      client.emit('newError', {
        error: 'error',
        message: "you're not authorized",
      });
      return client.disconnect();
    }

    if (this.activeConnected[user._id]) {
      client.emit('newError', {
        error: 'error',
        message: "someone is connected to you'r account",
      });
      return client.disconnect();
    }

    this.activeConnected[user._id] = client.id.toString();
    console.log('active connected are: ', this.activeConnected);
  }

  async deleteActiveConnected(client: ISocketClient) {
    const cookie = client.handshake.headers.cookie;
    const token = getCookieValueByName(cookie, 'token');
    const currentRoom = getCookieValueByName(cookie, 'currentRoom');

    let user: UserDocument;
    try {
      const verifiedData: ITokenData = await this.jwtService.verify(token);
      const { username } = verifiedData;
      user = await this.userModel.findOne({
        username: username,
      });
    } catch (e) {}
    if (!user) return;

    delete this.activeConnected[user._id];
    console.log(
      'user is disconnected and connected list now is: ',
      this.activeConnected,
    );

    if (currentRoom) {
      const room: RoomDocument = await this.roomModel.findById(currentRoom);
      await this.changeUserStatusInRoom(user._id, room, false);
    }
  }

  async connectToTheRoom(userData: IUserData, room: RoomDocument) {
    await this.removeUserUnread(userData.user, room._id);
    await this.changeUserStatusInRoom(userData.user._id, userData.room, true);
  }

  // helping functions
  private async removeUserUnread(
    user: UserDocument,
    roomId: string | Schema.Types.ObjectId,
  ) {
    console.log(user.unread[roomId.toString()]);

    user.unread[roomId.toString()] = 0;
    user.markModified('unread');
    user.save();
  }

  async changeUserStatusInRoom(
    userId: string,
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
