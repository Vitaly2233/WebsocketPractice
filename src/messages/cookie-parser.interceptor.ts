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
import { catchError, map, tap } from 'rxjs/operators';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/chat-interface/interface/token-data';
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
    // try {
    //   const cookie = client.handshake.headers.cookie;
    //   const roomId = getCookieValueByName(cookie, 'currentRoom');
    //   const room = await this.roomModel.findById(roomId);
    //   client.userData.room = room;
    // } cat  ch (e) {
    //   await client.emit('newError', { message: "you're not authorized" });
    // }
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof WsException) client.emit('newError', error);

        return 'error';
      }),
    );
  }
}
// map((data) => {
//         console.log(data);
//       }),

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
