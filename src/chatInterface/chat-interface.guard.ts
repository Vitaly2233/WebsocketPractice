import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatInterfaceGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    // const req: myReq = context.switchToHttp().getRequest();
    // const token: string = getCookieValueByName(req.headers.cookie, 'token');
    // let verifiedData: { username: string };
    // try {
    //   verifiedData = await this.jwtService.verify(token);
    // } catch (e) {
    //   return false;
    // }

    // if (!verifiedData) return false;
    // req.userData = verifiedData;
    return false;
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
