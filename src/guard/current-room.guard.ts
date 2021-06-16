/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';

@Injectable()
export class CurrentRoomGuard implements CanActivate {
  constructor(@InjectModel('room') private roomModel: Model<RoomDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('room guard is called');
    const client: ISocketClient = context?.switchToWs()?.getClient();
    const cookie = client?.handshake?.headers?.cookie;
    console.log('cookie', cookie);

    const roomId = getCookieValueByName(cookie, 'currentRoom');
    console.log('roomId from here: ', roomId);
    if (!roomId) return throwError(client);
    const room: RoomDocument = await this.roomModel.findById(roomId);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    client.userData.room = room;

    return true;
  }
}

function throwError(client: ISocketClient): boolean {
  client.emit('newError', {
    error: 'error',
    message: 'current room is missing',
  });
  client.disconnect();
  return false;
}
