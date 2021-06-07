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
export class OtherInterceptor implements NestInterceptor {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ISocketClient = context?.switchToWs()?.getClient();

    return next.handle();
  }
}
