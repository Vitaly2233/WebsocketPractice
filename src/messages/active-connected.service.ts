import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';
import { SocketClientDto } from './dto/socket-client.dto';

@Injectable()
export class ActiveConnectedService {
  private activeConnected = {};

  constructor(@InjectModel('room') private roomModel: Model<RoomDocument>) {}

  getActiveConnected() {
    return this.activeConnected;
  }
  // array of object contains room id and clint sockets
  addActiveConnected(chatId: string, clientId: string) {
    if (!this.activeConnected[chatId])
      this.activeConnected[chatId] = [clientId];
    else this.activeConnected[chatId].push(clientId);
  }

  async deleteActiveConnected(client: Socket) {
    client.rooms = {};
    await client.join(client.id);
  }

  async guardForNewConnected(client: SocketClientDto) {
    const cookie = client.handshake?.headers?.cookie;
    if (!cookie) throw new WsException('cookies are missing');
    const chatId: string = getCookieValueByName(cookie, 'currentRoom');
    if (!chatId) throw new WsException("You can't enter this room");
    const room = await this.roomModel.findById(chatId);
    if (room.id != chatId) throw new WsException("you're not in that chat");
    return {
      chatId: chatId,
      clientId: client.id,
      participants: room.participants,
    };
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
