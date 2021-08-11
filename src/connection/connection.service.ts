import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/user/schema/user.schema';
import { getCookieValueByName } from 'src/common/helpers/get-cookie-value';
import { ISocketClient } from '../common/interface/socket-client';
import { ITokenData } from '../auth/interface/token-data.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { WsException } from '@nestjs/websockets';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class ConnectionService {
  private activeConnected = {};

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
  ) {}

  getActiveConnected() {
    return this.activeConnected;
  }

  async handleConnection(client: ISocketClient, cookie: string) {
    if (!cookie) return client.disconnect();

    const token: string | undefined = getCookieValueByName(cookie, 'token');

    const verifiedData: ITokenData = await this.jwtService.verify(token);
    if (!verifiedData) return client.disconnect();

    const { username } = verifiedData;
    if (!username) return client.disconnect();

    const user = await this.userService.findOneByUsername(username);
    if (!user) return client.disconnect();

    this.activeConnected[user._id] = client.id.toString();
    console.log('active connected are: ', this.activeConnected);
  }

  async deleteActiveConnected(client: ISocketClient) {
    const cookie = client.handshake.headers.cookie;
    const token = getCookieValueByName(cookie, 'token');
    const currentRoomId = getCookieValueByName(cookie, 'currentRoom');
    const verifiedData: ITokenData = await this.jwtService.verify(token);
    const { username } = verifiedData;
    const user = await this.userService.findOneByUsername(username);
    if (!user) return;
    delete this.activeConnected[user._id];

    if (currentRoomId)
      await this.roomService.close(client, user._id, currentRoomId);
  }
}
