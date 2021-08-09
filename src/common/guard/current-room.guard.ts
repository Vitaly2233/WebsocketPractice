import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ISocketClient } from 'src/common/interface/socket-client';
import { getCookieValueByName } from 'src/common/helpers/get-cookie-value';
import { RoomService } from 'src/room/room.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class CurrentRoomGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: ISocketClient = context?.switchToWs()?.getClient();
    const cookie = client?.handshake?.headers?.cookie;
    const roomId = getCookieValueByName(cookie, 'currentRoom');

    if (!roomId) throw new WsException(`room id is missing in cookies`);

    client.userData.room = await this.roomService.findById(roomId);

    console.log('current room: ', client.userData.room._id);

    return true;
  }
}
