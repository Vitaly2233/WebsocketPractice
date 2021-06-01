import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

export interface myReq extends Request {
  headers: {
    cookie?: string;
  };
  userData?: {
    username: string;
  };
}

@Injectable()
export class ChatInterfaceGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: myReq = context.switchToHttp().getRequest();
    const token: string = getCookieValueByName(req.headers.cookie, 'token');

    const verifiedData = this.jwtService.verify(token);
    if (!verifiedData) return false;
    req.userData = verifiedData;
    return true;
  }
}

function getCookieValueByName(cookie: string, name: string) {
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
