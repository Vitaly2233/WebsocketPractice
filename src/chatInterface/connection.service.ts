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
    // try {
    //   const cookie = client.handshake?.headers?.cookie;
    //   if (!cookie) throw new WsException('cookies are missing');
    //   const roomId: string = getCookieValueByName(cookie, 'currentRoom');
    //   const room = await this.roomModel.findById(roomId);
    //   const token: string = getCookieValueByName(cookie, 'token');
    //   const verifiedData: TokenDataDto = await this.jwtService.verify(token);
    //   this.activeConnected.push(client.id);
    // } catch (e) {
    //   client.emit('newError', { message: "you're not authorized" });
    // }
    // return { username: verifiedData.username };
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
