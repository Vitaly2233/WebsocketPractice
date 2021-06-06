import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/chat-interface/interface/token-data';

@Injectable()
export class TokenGuard implements CanActivate {
  // constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    // try {
    //   const client: ISocketClient = context.switchToHttp().getRequest();
    //   const cookie = client.handshake.headers.cookie;
    //   const token: string = getCookieValueByName(cookie, 'token');
    //   const verifiedData: ITokenData = await this.jwtService.verify(token);
    //   client.userData.username = verifiedData.username;
    // } catch (e) {
    //   return false;
    // }
    console.log('token guard is called');

    return true;
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
