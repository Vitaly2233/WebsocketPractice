/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/auth/dto/token-data';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel('user') private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: ISocketClient = context.switchToWs().getClient();
    client.userData = {};
    const cookie = client.handshake?.headers?.cookie;
    const date = new Date(Date.now()).toLocaleTimeString();

    console.log(
      '-------------------------------------------------------------------------------------',
      date,
    );

    console.log('cookies in guard: ', cookie);
    const tokens: string[] = await Promise.all([
      getCookieValueByName(cookie, 'token'),
    ]);
    const token = tokens[0];
    console.log('token in guard', token);

    const verifiedData: ITokenData = await this.jwtService.verify(token);

    // @ts-ignore
    client.userData.user = await this.userModel.findOne({
      username: verifiedData.username,
    });

    if (!client.userData.user) {
      console.log('in token guard 44');

      return throwError(client);
    }

    return true;
  }
}

function throwError(client: ISocketClient): boolean {
  client.emit('newError', { error: 'error', message: "you're not authorized" });
  return client.disconnect();
}
