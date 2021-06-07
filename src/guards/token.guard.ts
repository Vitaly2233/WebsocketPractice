import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/chat-interface/interface/token-data';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const client: ISocketClient = context.switchToHttp().getRequest();
    try {
      const cookie = client.handshake.headers.cookie;
      const token: string = getCookieValueByName(cookie, 'token');
      const verifiedData: ITokenData = await this.jwtService.verify(token);
      client.userData.username = verifiedData.username;
    } catch (e) {
      console.log('token guard is flased');
      return false;
    }

    return true;
  }
}
