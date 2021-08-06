import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import config from 'src/common/config';
import { getCookieValueByName } from 'src/helpers/get-cookie-value';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from '../interface/token-data.interface';

const cookieExtractor = function (client: ISocketClient) {
  const token = getCookieValueByName(client.handshake.headers.cookie, 'token');
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: config.JWT.SECRET,
    });
  }

  async validate(payload: ITokenData) {
    return { ...payload };
  }
}
