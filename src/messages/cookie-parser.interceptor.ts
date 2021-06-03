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
import { TokenDataDto } from 'src/chatInterface/dto/token-data.dto';
import { RoomDocument } from 'src/chatInterface/shemas/room.schema';

@Injectable()
export class CookieParserInterceptor implements NestInterceptor {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const client = context.switchToWs().getClient();
    const cookie = client.handshake?.headers?.cookie;
    if (!cookie) throw new WsException('token is missing');
    const roomId = getCookieValueByName(cookie, 'currentRoom');
    if (!roomId) throw new WsException('token is missing');
    const room = await this.roomModel.findById(roomId);
    if (room.id != roomId) throw new WsException('token is missing');

    const token: string = getCookieValueByName(cookie, 'token');
    let verifiedData: TokenDataDto;
    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      throw new WsException('token is missing');
    }

    client.userData = {
      room: room,
      username: verifiedData.username,
    };
    return client;
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
