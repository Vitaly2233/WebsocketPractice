import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './dto/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  async register(payload: User) {
    const { username, password } = payload;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UserDocument = new this.userModel({
      username: username,
      password: hashedPassword,
    });

    try {
      await newUser.save();
    } catch (e) {
      throw new HttpException('user with the username is already exists', 400);
    }

    return newUser;
  }
}
