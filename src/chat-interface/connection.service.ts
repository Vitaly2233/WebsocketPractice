import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { ISocketClient } from './interface/socket-client';
import { ITokenData } from './interface/token-data';
import { RoomDocument } from './shemas/room.schema';

@Injectable()
export class ConnectionsService {
  private activeConnected: string[] = [];

  constructor(
    private jwtService: JwtService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

  async deleteActiveConnected(client: ISocketClient) {
    client.rooms = {};
    await client.join(client.id);
  }

  async handleConnection(client: ISocketClient) {
    const cookie: string | undefined = client?.handshake?.headers?.cookie;
    if (!cookie)
      return client.emit('newError', { message: "you're not authorized" });
    const token: string | undefined = getCookieValueByName(cookie, 'token');
    let verifiedData: ITokenData;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      return client.emit('newError', { message: "you're not authorized" });
    }
    const { username } = verifiedData;
    if (!username) throw new WsException('cookie is missng');
    const userRoomIds: string[] | undefined = (
      await this.userModel.findOne({
        username: username,
      })
    )?.rooms;
    if (!userRoomIds) throw new WsException('cookie is missng');
    this.activeConnected.push(client.id);
    const roomId: string = getCookieValueByName(cookie, 'currentRoom');
    if (roomId) {
      // if user is already connecteed to thiss room, add checking if he's in the room
    }

    const participants: Record<string, string[]> = {};
    for (const userRoom of userRoomIds) {
      const result = await this.roomModel.findById(userRoom);
      if (!result)
        return client.emit('newError', {
          message: "you're not into the room",
        });
      participants[userRoom] = result.participants;
    }
    client.emit('getChats', participants);
  }
}
