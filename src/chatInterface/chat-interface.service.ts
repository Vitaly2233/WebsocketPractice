import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/dto/user.schema';
import { myReq } from './chat-interface.guard';
import { FindUserDto } from './dto/find-user.dto';
import { RoomDocument } from './shemas/room.schema';

@Injectable()
export class ChatInterfaceService {
  constructor(
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
  ) {}

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

  async findUsers(
    participants: string[],
    username: string,
  ): Promise<HttpException | FindUserDto> {
    participants.push(username);
    if (hasDuplicates(participants))
      throw new HttpException('list of users contains dublicates', 404);

    const newRoom = new this.roomModel({
      participants: [],
    });
    // eslint-disable-next-line prefer-const
    let declinedUsers: string[] = [];
    for (const participant of participants) {
      const result: UserDocument = await this.userModel.findOneAndUpdate(
        { username: participant },
        { $addToSet: { chats: newRoom._id } },
      );
      if (!result) declinedUsers.push(participant);
      newRoom.participants.push(participant);
    }
    if (newRoom.participants.length < 2)
      throw new HttpException(
        'length of valid users must be greather than 1',
        404,
      );
    await newRoom.save();

    const payload: FindUserDto = {
      particiants: participants,
      declinedUsers: declinedUsers,
    };
    return payload;
  }
}

function hasDuplicates(arr: string[]) {
  return new Set(arr).size !== arr.length;
}
