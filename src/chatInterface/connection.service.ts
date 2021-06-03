import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { SocketClientDto } from './dto/socket-client.dto';
import { TokenDataDto } from './dto/token-data.dto';
import { RoomDocument } from './shemas/room.schema';

@Injectable()
export class ConnectionsService {
  private activeConnected: string[] = [];

  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private jwtService: JwtService,
  ) {}

  async deleteActiveConnected(client: SocketClientDto) {
    client.rooms = {};
    await client.join(client.id);
  }

  async guardForNewConnected(client: SocketClientDto) {
    const cookie = client.handshake?.headers?.cookie;
    if (!cookie) throw new WsException('cookies are missing');

    const roomId: string = getCookieValueByName(cookie, 'currentRoom');
    const room = await this.roomModel.findById(roomId);
    if (room.id != roomId) throw new WsException("you're not in that chat");

    const token: string = getCookieValueByName(cookie, 'token');
    let verifiedData: TokenDataDto;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      throw new WsException('token is missing');
    }

    this.activeConnected.push(client.id);

    return { username: verifiedData.username };
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
