import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Schema } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageService } from 'src/messages/message.service';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ConnectionService {
  private activeConnected = {};

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => MessageService))
    private messageSrvice: MessageService,
    @InjectModel('user') private userModel: Model<UserDocument>,
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

    // validating a token
    let verifiedData: ITokenData;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      client.emit('newError', { message: "you're not authorized" });
      return client.disconnect();
    }
    const { username } = verifiedData;
    if (!username) {
      client.emit('newError', { message: 'cookie is missing' });
      return client.disconnect();
    }

    let user: UserDocument;
    try {
      user = await this.userModel.findOne({ username: username });
    } catch (e) {
      client.emit('newError', { message: 'user is not found' });
      return client.disconnect();
    }

    if (user?._id == undefined) {
      client.emit('newError', {
        error: 'error',
        message: "you're not authorized",
      });
      client.disconnect();
    }

    this.activeConnected[user?._id] = client.id;
    console.log(
      'user is connected and new list is like: ',
      this.activeConnected,
    );
  }

  async deleteActiveConnected(client: ISocketClient) {
    const cookie = client.handshake.headers.cookie;
    const token = getCookieValueByName(cookie, 'token');

    let verifiedData: ITokenData;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {}
    const { username } = verifiedData;

    const user: UserDocument = await this.userModel.findOne({
      username: username,
    });

    delete this.activeConnected[user?._id];
    console.log(
      'user is disconnected and connected list now is: ',
      this.activeConnected,
    );
  }

  async getAllMessagesInRoom(client: ISocketClient, room: RoomDocument) {
    const removedUnread = this.removeUserUnread(client.userData.user, room._id);
    if (!removedUnread)
      throw new WsException('user is not found to delete hiw unreads');

    const changedStatus = await this.changeUserStatusInRoom(
      client.userData.user._id,
      client.userData.room,
      true,
    );
    if (!changedStatus) throw new WsException('status is not changed');

    const messages = await this.messageSrvice.getAllMessages(client, room);
    client.emit('getAllMessages', messages);
  }

  async removeUserUnread(
    user: UserDocument,
    roomId: string | Schema.Types.ObjectId,
  ): Promise<boolean> {
    const allUnread = user.unread;
    let index = 0;
    //

    if (allUnread.length == 0) {
      return true;
    }

    //
    for (const unreadMessage of allUnread) {
      if (unreadMessage.id == roomId) {
        allUnread.splice(index);
        await user.save();
        return true;
      }
      index++;
    }
    return false;
  }

  async changeUserStatusInRoom(
    userId: string,
    room: RoomDocument,
    status: boolean,
  ) {
    let index = 0;

    if (room.isOnline.length == 0) return true;

    for (const participant of room.isOnline) {
      if ((participant.user = userId)) {
        room.isOnline[index].status = status;
        return true;
      }
      index++;
    }
    return false;
  }
}
