import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, ObjectId, Schema } from 'mongoose';
import { UnreadMessage, User, UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageFrontend } from 'src/messages/interface/message-frontend';
import { MessageService } from 'src/messages/message.service';
// import { IActiveConnected } from './interface/active-connected.interface';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ConnectionService {
  private activeConnected: Record<string, string>[] = [];
  // IActiveConnected

  constructor(
    private jwtService: JwtService,
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

    this.activeConnected = [
      ...new Set(
        this.activeConnected.map((x) => {
          getKeyByValue(x, user._id);
          return { [user._id]: x[user._id] };
        }),
      ),
    ];

    this.activeConnected.push({ [user._id]: client.id });

    console.log(this.activeConnected);
  }

  async deleteActiveConnected(client: ISocketClient) {
    const cookie = client.handshake.headers.cookie;
    const token = getCookieValueByName(cookie, 'token');

    let verifiedData: ITokenData;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {}
    const { username } = verifiedData;
    // try {
    //   const user: UserDocument = await this.userModel.findOne({
    //     username: username,
    //   });
    //   this.activeConnected.forEach((connectedUser) => {
    //     if (connectedUser[user._id]) {
    //       const index = this.activeConnected.indexOf(connectedUser[user._id]);
    //       console.log(index);
    //       this.activeConnected.splice(index + 1);
    //     }
    //   });
    // } catch (e) {}

    console.log(this.activeConnected);
  }

  async connectToTheRoom(client: ISocketClient, room: Room) {
    const removedUnread = this.removeUserUnread(client.userData.user, room._id);
    if (!removedUnread)
      throw new WsException('user is not found to delete hiw unreads');

    const changedStatus = await this.changeUserStatusInRoom(
      client.userData.user._id,
      client.userData.room,
      true,
    );
    if (!changedStatus) throw new WsException('status is not changed');

    const messages = await this.messageSrvice.getAllMessages(client);
    client.emit('getAllMessages', messages);
  }

  async removeUserUnread(
    user: UserDocument,
    roomId: string | Schema.Types.ObjectId,
  ): Promise<boolean> {
    const allUnread = user.unread;
    let index = 0;
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

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
