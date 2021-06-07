import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageService } from 'src/messages/message.service';
import { IActiveConnected } from './interface/active-connected.interface';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ConnectionService {
  private activeConnected: IActiveConnected;

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
    if (!cookie)
      return client.emit('newError', { message: 'cookie is missing' });
    const token: string | undefined = getCookieValueByName(cookie, 'token');

    // validating a token
    let verifiedData: ITokenData;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      return client.emit('newError', { message: "you're not authorized" });
    }
    const { username } = verifiedData;
    if (!username)
      return client.emit('newError', { message: 'cookie is missing' });

    let user: UserDocument;
    try {
      user = await this.userModel.findOne({ username: username });
    } catch (e) {
      return client.emit('newError', { message: 'user is not found' });
    }
    this.activeConnected.push({ [client.id]: user._id });
    console.log(this.activeConnected);

    // return to user his chats with participant usernames and ids of this chats
    const sendUserRooms: Record<string, ObjectId> = {};
    const userRoomsPopulated: UserDocument = await (
      await this.userModel.findOne({ username: username }).populate('rooms')
    ).execPopulate();
    const userRooms = userRoomsPopulated.rooms;
    userRooms.forEach((userRoom: Room) => {
      sendUserRooms[userRoom.roomName] = userRoom._id;
    });

    client.emit('getUserRooms', userRooms);
  }

  async deleteActiveConnected(client: ISocketClient) {
    client.rooms = {};
    delete this.activeConnected[client.id];
  }
}
