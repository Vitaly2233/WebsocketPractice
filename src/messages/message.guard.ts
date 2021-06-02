import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';

@Injectable()
export class MessageGuard implements CanActivate {
  constructor(@InjectModel('room') private roomModel: Model<RoomDocument>) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const client = context.switchToWs().getClient();
    const cookie = client.handshake?.headers?.cookie;
    if (!cookie) return false;
    const chatId = getCookieValueByName(cookie, 'currentRoom');
    if (!chatId) return false;
    const room = await this.roomModel.findById(chatId);
    if (room.id != chatId) return false;
    client.userData = {
      chatId: chatId,
    };
    return true;
  }
}
function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
