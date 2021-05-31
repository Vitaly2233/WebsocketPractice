import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './dto/user.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

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

  async login(body: User): Promise<HttpException | JwtTokenDto> {
    console.log(body);

    const { username, password } = body;
    const user = await this.userModel.findOne({ username: username });
    if (!user)
      throw new HttpException("invalid username, or user doesn't exist", 404);
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) throw new HttpException('wrong password', 404);

    const token: string = this.jwtService.sign({ username });
    const payload: JwtTokenDto = {
      access_token: token,
    };
    return payload;
  }
}
