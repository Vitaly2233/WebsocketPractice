import { Injectable } from '@nestjs/common';
import { User } from './dto/user.schema';

@Injectable()
export class AuthService {
  register(payload: User) {
    console.log(payload);
  }
}
