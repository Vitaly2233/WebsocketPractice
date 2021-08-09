import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { RegisterRequestDto } from 'src/auth/dto/register-request.dto';
import { UserDocument } from 'src/user/schema/user.schema';
import { WsException } from '@nestjs/websockets';
import { Room } from 'src/room/schema/room.schema';

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
  async findById(id) {
    return this.userModel.findById(id);
  }

  async updateOne(
    _id: string | Types._ObjectId,
    updateData: UpdateQuery<UserDocument>,
  ) {
    return this.userModel.updateOne({ _id }, updateData);
  }

  async updateByIds(ids: string[], updateData: UpdateQuery<UserDocument>) {
    return this.userModel.updateMany({ _id: { $in: ids } }, updateData);
  }

  async removeUnreads(user: UserDocument, roomId: string | Types._ObjectId) {
    user.unread[roomId.toString()] = 0;
    user.markModified('unread');
    user.save();
  }

  async getUnreads(
    userId: Types._ObjectId | string,
    roomId: Types._ObjectId | string,
  ): Promise<number> {
    const user: UserDocument = await this.userModel.findById(userId);

    if (user.unread[roomId.toString()]) return user.unread[roomId.toString()];
    return 0;
  }

  async getUserRooms(userId: Types._ObjectId | string) {
    const rooms = (
      await this.userModel.findById(userId, [], {
        populate: 'rooms',
      })
    ).rooms;

    rooms.forEach((room: Room | Types._ObjectId) => {
      if (room instanceof Types._ObjectId)
        throw new WsException(`user room ${room} not found`);
    });

    return rooms as Room[];
  }
}
