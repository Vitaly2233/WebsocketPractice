import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/dto/user.schema';
import { myReq } from './chat-interface.guard';

@Injectable()
export class ChatInterfaceService {
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  async getChats(req: myReq): Promise<string[] | HttpException> {
    const { username } = req.userData;
    const chats = (
      await this.userModel.findOne({
        username: username,
      })
    )?.chats;
    if (!chats) return new HttpException("can't find the user", 404);
    return chats;
  }

  async findUsers(participants: string[]): Promise<HttpException | string[]> {
    return new HttpException('asd', 404);
  }
}
