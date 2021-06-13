import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/Schema/user.schema';
import { ISocketClient } from 'src/chat-interface/interface/socket-client';
import { ITokenData } from 'src/chat-interface/interface/token-data';
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
    const token: string = getCookieValueByName(cookie, 'token');
    let verifiedData: ITokenData;

    try {
      verifiedData = await this.jwtService.verify(token);
    } catch (e) {
      await client.disconnect();
      return false;
    }

    try {
      client.userData.user = await this.userModel.findOne({
        username: verifiedData.username,
      });
    } catch (e) {
      client.emit('newError', { message: 'user does not exist' });
      await client.disconnect();
      return false;
    }

    return true;
  }
}
