import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/Schema/user.schema';
import { RoomDocument } from 'src/chat-interface/schema/room.schema';
import { MessageDocument } from 'src/messages/schema/message.schema';

@Injectable()
export class MongooseHelpService {
  constructor(
    @InjectModel('message') private messageModel: Model<MessageDocument>,
    @InjectModel('room') private roomModel: Model<RoomDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>,
  ) {}

  async createRoom(
    roomName: string,
    participantUsernames: string[],
  ): Promise<boolean> {
    const newRoom = new this.roomModel({
      roomName: roomName,
      participants: [],
    });
    const users = await Promise.all(
      participantUsernames.map(async (participantUsername: string) => {
        const user: UserDocument = await this.userModel.findOne({
          username: participantUsername,
        });
        return user;
      }),
    );
    if (users.includes(undefined)) return false;

    users.forEach((user: UserDocument) => {
      newRoom.participants.push(user._id);
      this.userModel.findByIdAndUpdate(user._id, {
        $push: { rooms: newRoom._id },
      });
    });
  }
}
