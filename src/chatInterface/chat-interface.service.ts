import { HttpException, Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/dto/user.schema';
import { ChatInterfaceGuard } from './chat-interface.guard';

@UseGuards(ChatInterfaceGuard)
@Injectable()
export class ChatInterfaceService {
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  async findUsers(participants: string[]): Promise<HttpException | string[]> {
    return new HttpException('asd', 404);
  }

  async getUsers(req: Request) {
    // this.userModel.findOne({username: })
  }
}
