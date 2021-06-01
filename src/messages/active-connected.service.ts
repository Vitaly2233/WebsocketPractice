import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

interface ActiveConnectedDto {
  chat: {
    chatId: string;
    clientIds: string[];
  };
}

@Injectable()
export class ActiveConnectedService {
  private activeConnected: ActiveConnectedDto[];

  getActiveConnected() {
    return this.activeConnected;
  }
  // array of object contains room id and clint sockets
  addActiveConnected(clientId: string, cookie: string) {
    const chatId = getCookieValueByName(cookie, 'currentRoom');
    if (!chatId) throw new WsException("You can't enter this room");

    // if (!this.activeConnected) this.activeConnected[chatId] = [clientId];
    // else this.activeConnected[chatId].push(clientId);
    // console.log('active connected', this.activeConnected);
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
