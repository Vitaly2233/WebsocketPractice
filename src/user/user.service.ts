import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { RegisterRequestDto } from 'src/auth/dto/register-request.dto';
import { UserDocument } from 'src/user/Schema/user.schema';
import { WsException } from '@nestjs/websockets';
import { IUserRoomResponse } from './interface/user-rooms.interface';

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

  async updateUser(
    _id: string | Types._ObjectId,
    updateData: UpdateQuery<UserDocument>,
  ) {
    return this.userModel.updateOne({ _id }, updateData);
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
    const userRooms = (
      await this.userModel.findById(userId, [], {
        populate: 'rooms',
      })
    ).rooms;

    const sendUserRooms: IUserRoomResponse[] = [];
    for (const userRoom of userRooms) {
      if (userRoom instanceof Types._ObjectId)
        throw new WsException('user rooms not found');

      const { roomName, _id } = userRoom;
      const sendUserRoom: IUserRoomResponse = {};
      sendUserRoom[roomName] = {};
      sendUserRoom[roomName].unread = await this.getUnreads(userId, _id);
      sendUserRoom[roomName].id = _id;
      sendUserRooms.push(sendUserRoom);
    }
    return sendUserRooms;
  }
}
