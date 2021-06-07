import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';

@Injectable()
export class CookieParserInterceptor implements NestInterceptor {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ISocketClient = context?.switchToWs()?.getClient();
    client.userData = {};
    const cookie = client?.handshake?.headers?.cookie;
    const roomId = getCookieValueByName(cookie, 'currentRoom');
    const token = client.userData.token;
    let room: RoomDocument;
    try {
      room = await this.roomModel.findById(roomId);
    } catch (e) {}
    client.userData.token = token;
    client.userData.room = room;
    return next.handle();
  }
}
