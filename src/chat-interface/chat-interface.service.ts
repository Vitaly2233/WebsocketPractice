import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, ObjectId } from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { MessageService } from 'src/messages/message.service';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { Room, RoomDocument } from './schema/room.schema';

@Injectable()
export class ChatInterfaceService {
  private activeConnected: string[] = [];

  constructor(
    private jwtService: JwtService,
    private messsageService: MessageService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async handleConnection(client: ISocketClient) {
    // check the valid of user data cookies etc...
    const cookie: string | undefined = client?.handshake?.headers?.cookie;
    if (!cookie)
      return client.emit('newError', { message: 'cookie is missing' });
    const token: string | undefined = getCookieValueByName(cookie, 'token');
    const currentRoomId: string = getCookieValueByName(cookie, 'currentRoom');

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

    const user = await this.userModel.findOne({ username: username });
    if (!user) return client.emit('newError', { message: 'user is not found' });
    this.activeConnected.push(user._id);
    // if user is already connecteed to this room, add checking if he's in the room
    if (currentRoomId) {
      if (!this.messsageService.getAllMessages(client, currentRoomId))
        return client.emit('newError', { message: "you're not into the room" });
    }

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
    const indexOfConnectedUSer = this.activeConnected.indexOf(
      client.userData.username,
    );
    this.activeConnected.splice(indexOfConnectedUSer);
    await client.join(client.id);
  }
}
