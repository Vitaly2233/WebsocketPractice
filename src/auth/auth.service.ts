import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './Schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/token.dto';
import { ITokenData } from 'src/auth/dto/token-data';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(payload: { username: string; password: string }) {
    const { username, password } = payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UserDocument = new this.userModel({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    return newUser;
  }

  async login(body: {
    username: string;
    password: string;
  }): Promise<HttpException | JwtTokenDto> {
    const { username, password } = body;
    const user = await this.userModel.findOne({
      username: username,
    });
    if (!user)
      throw new HttpException("invalid username, or user doesn't exist", 404);

    const isEqual: boolean = await bcrypt.compare(password, user.password);
    if (!isEqual) throw new HttpException('wrong password', 404);
    const tokenData: ITokenData = {
      username: username,
    };
    const token: string = this.jwtService.sign(tokenData);
    const payload: JwtTokenDto = {
      access_token: token,
    };

    return payload;
  }
}
