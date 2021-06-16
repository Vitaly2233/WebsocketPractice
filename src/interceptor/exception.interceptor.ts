import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Error } from 'mongoose';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const client: ISocketClient = context.switchToWs().getClient();
    return next.handle().pipe(
      catchError((error) => {
        console.log(
          'error occured',
          '\n\n-----------------------------\n\n',
          error,
          '\n\n-----------------------------\n\n',
        );
        if (error instanceof Error)
          client.emit('newError', {
            status: 'error',
            message: 'data is not found',
          });

        if (error instanceof WsException)
          client.emit('newError', { status: 'error', message: error.message });
        client.disconnect();
        return 'error';
      }),
    );
  }
}
