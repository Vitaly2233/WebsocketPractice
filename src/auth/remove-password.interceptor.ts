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
import { map, tap } from 'rxjs/operators';
import { ITokenData } from 'src/chat-interface/interface/token-data';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { UserDocument } from './Schema/user.schema';

@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        data.password = null;
        console.log(data);
        return data;
      }),
    );
  }
}
