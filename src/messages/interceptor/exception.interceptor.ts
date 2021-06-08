import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Model, Error } from 'mongoose';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/chat-interface/interface/token-data';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';

import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ISocketClient = context.switchToWs().getClient();
    return next.handle().pipe(
      catchError((error) => {
        console.log(error);

        if (error instanceof Error)
          client.emit('newError', {
            status: 'error',
            message: 'data is not found',
          });

        if (error instanceof WsException)
          client.emit('newError', { status: 'error', message: error.message });
        return 'error';
      }),
    );
  }
}
