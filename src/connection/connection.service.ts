import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';
import { getCookieValueByName } from 'src/common/helpers/get-cookie-value';
import { ISocketClient } from '../common/interface/socket-client';
import { ITokenData } from '../auth/interface/token-data.interface';
import { RoomDocument } from '../room/schema/room.schema';
import { IUserData } from '../common/interface/user-data.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { WsException } from '@nestjs/websockets';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class ConnectionService {
  private activeConnected = {};

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private authService: AuthService,
    private roomService: RoomService,
  ) {}

  getActiveConnected() {
    return this.activeConnected;
  }

  async handleConnection(client: ISocketClient) {
    const cookie: string | undefined = client?.handshake?.headers?.cookie;
    if (!cookie) {
      client.emit('newError', { message: 'cookie is missing' });
      return client.disconnect();
    }
    const token: string | undefined = getCookieValueByName(cookie, 'token');

    const verifiedData: ITokenData = await this.jwtService.verify(token);
    if (!verifiedData) {
      client.emit('newError', { message: "you're not authorized" });
      return client.disconnect();
    }
    const { username } = verifiedData;
    if (!username) {
      client.emit('newError', { message: 'cookie is missing' });
      return client.disconnect();
    }
    const user: UserDocument = await this.authService.validateUsername(
      username,
    );
    if (this.activeConnected[user._id])
      throw new WsException("someone is connected to you'r account");
    this.activeConnected[user._id] = client.id.toString();
    console.log('active connected are: ', this.activeConnected);
  }

  async deleteActiveConnected(client: ISocketClient) {
    const cookie = client.handshake.headers.cookie;
    const token = getCookieValueByName(cookie, 'token');
    const currentRoom = getCookieValueByName(cookie, 'currentRoom');

    const verifiedData: ITokenData = await this.jwtService.verify(token);
    const { username } = verifiedData;
    const user = await this.userService.findOneByUsername(username);
    if (!user) return;

    delete this.activeConnected[user._id];
    console.log(
      'user is disconnected and connected list now is: ',
      this.activeConnected,
    );

    if (currentRoom) {
      const room: RoomDocument = await this.roomService.findById(currentRoom);
      await this.roomService.changeUserStatus(user._id, room, false);
    }
  }
}
