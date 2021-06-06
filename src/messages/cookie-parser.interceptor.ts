import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';

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
    const client: ISocketClient = context.switchToWs().getClient();
    const cookie = client.handshake.headers.cookie;
    const roomId = getCookieValueByName(cookie, 'currentRoom');
    const room = await this.roomModel.findById(roomId);
    client.userData.roomId = room._id;
    return next.handle();
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
