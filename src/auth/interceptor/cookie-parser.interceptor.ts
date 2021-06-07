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
    console.log('here');

    client.userData = {};
    const cookie = client?.handshake?.headers?.cookie;
    const roomId = getCookieValueByName(cookie, 'currentRoom');
    const token = getCookieValueByName(cookie, 'token');
    // const room: RoomDocument | undefined = await this.roomModel?.findById(
    //   roomId,
    // );
    client.userData.token = token;
    client.userData.token = 'dfsfsds';
    return next.handle();
  }
}
