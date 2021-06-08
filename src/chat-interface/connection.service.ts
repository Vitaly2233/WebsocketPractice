import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
// import { IActiveConnected } from './interface/active-connected.interface';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ConnectionService {
  private activeConnected = [];
  // IActiveConnected

  constructor(
    private jwtService: JwtService,
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
    try {
      const user: UserDocument = await this.userModel.findOne({
        username: username,
      });
      this.activeConnected.forEach((connectedUser) => {
        if (connectedUser[user._id]) {
          const index = this.activeConnected.indexOf(connectedUser[user._id]);
          this.activeConnected.splice(index + 1);
        }
      });
    } catch (e) {}

    console.log(this.activeConnected);
  }
}
