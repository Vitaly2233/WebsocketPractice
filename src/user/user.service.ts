import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { RegisterRequestDto } from 'src/auth/dto/register-request.dto';
import { UserDocument } from 'src/auth/Schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  async create({
    username,
    password,
  }: RegisterRequestDto): Promise<UserDocument> {
    const newUser: UserDocument = new this.userModel({
      username,
      password,
    });
    await newUser.save();
    return newUser;
  }

  async findOneByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username });
  }
}
