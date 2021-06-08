import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { IActiveConnected } from './interface/active-connected.interface';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ConnectionService {
  private activeConnected: IActiveConnected = [];

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
    this.activeConnected.push({ [client.id]: user._id });
  }

  async deleteActiveConnected(client: ISocketClient) {
    client.rooms = {};
    delete this.activeConnected[client.id];
  }
}
