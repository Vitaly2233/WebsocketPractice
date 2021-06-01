import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/dto/user.schema';
import { myReq } from './chat-interface.guard';
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
  ): Promise<HttpException | string[]> {
    console.log(participants);

    participants.push(username);
    if (hasDuplicates(participants))
      throw new HttpException('list of users contains dublicates', 404);

    const newRoom = new this.roomModel({
      participants: participants,
    });
    for (const participant of participants) {
      this.userModel.findOneAndUpdate(
        { username: participant },
        { $addToSet: { rooms: newRoom._id } },
      );
    }
    await newRoom.save();
    return participants;
  }
}

function hasDuplicates(arr: string[]) {
  return new Set(arr).size !== arr.length;
}
